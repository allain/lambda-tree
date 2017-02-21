const request = require('request')

const treesStore = require('../../stores/trees.js')
const undone = require('../../undone.js')
const relativeUrl = require('../../relative-url.js')

const step = require('./_step.js')

module.exports.get = function (event, context, callback) {
  const treeId = event.pathParameters.treeId
  if (!treeId.match(/^[a-z0-9_-]+$/i))
    return complain('invalid treeId', 400)


  treesStore.queryTree(treeId, (err, tree) => {
    if (err) return complain(err, 500)

    if (!tree) return complain('tree not found', 404)

    if (tree.finished) {
      return treesStore.queryRequest(treeId, tree.id, (err, req) => {
        if (err) return complain(err, 500)

        const response = {
          statusCode: 200,
          headers: {
            'Content-Type': req.productType || 'application/json'
          },
          body: req.product
        }

        callback(null, response)
      })
    }

    const rootUrl = relativeUrl(event, '/trees/' + treeId + '/')
    step(tree, rootUrl, (err, started) => {
      if (err) return console.error(err)

      callback(null, { statusCode: 202 /* Accepted */ })
    })
  })

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
