'use strict'

const tv4 = require('tv4')

const trees = require('../../stores/trees.js')
const expand = require('../../expand-submission.js')
const relativeUrl = require('../../relative-url.js')

const requestSchema = require('./submit-schema.js')
const step = require('./_step.js')

const complaint = require('../../http-utils/complaint.js')

module.exports.post = (event, context, callback) => {
  const request = expand(JSON.parse(event.body))
  if (!tv4.validate(request, requestSchema))
    return callback(null, complaint(tv4.error.message, 400))

  trees.createTree(request, (err, treeId) => {
    if (err) return callback(null, complaint('unable to create job in db', 400))

    trees.queryTree(treeId, (err, tree) => {
      if (err) callback(new Error('unable to query tree)'))

      step(
        tree,
        relativeUrl(event, `trees${treeId}/`),
        err => (err ? callback(new Error('unable to auto-start tree')) : null)
      )
    })

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        treeUrl: relativeUrl(event, 'trees/' + treeId)
      })
    })
  })
}
