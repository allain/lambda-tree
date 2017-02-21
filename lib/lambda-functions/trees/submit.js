'use strict'

const tv4 = require('tv4')

const trees = require('../../stores/trees.js')
const expand = require('../../expand-submission.js')
const relativeUrl = require('../../relative-url.js')

const requestSchema = require('./submit-schema.js')
const step = require('./_step.js')

module.exports.post = (event, context, callback) => {
  const request = expand(JSON.parse(event.body))
  if (!tv4.validate(request, requestSchema))
    return complain(tv4.error.message, 400)

  trees.createTree(request, (err, treeId) => {
    if (err) return complain('unable to create job in db', 500)
    trees.queryTree(treeId, (err, tree) => {
      const rootUrl = relativeUrl(event, 'trees/' + treeId + '/')
      step(tree, rootUrl, (err) => {
        if (err) callback(new Error('unable to auto-start tree'))
      })
    })

    return succeed(treeId)
  })

  function succeed(treeId) {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        treeUrl: relativeUrl(event, 'trees/' + treeId)
      })
    }

    callback(null, response)
  }

  function complain(err, code) {
    const response = {
      statusCode: code,
      body: JSON.stringify({
        statusCode: code,
        error: '' + err
      })
    }

    return callback(null, response)
  }
}
