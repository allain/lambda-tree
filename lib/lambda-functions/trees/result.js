const treesStore = require('../../stores/trees.js')
const relativeUrl = require('../../relative-url.js')
const complaint = require('../../http-utils/complaint')

const step = require('./_step.js')

module.exports.get = function(event, context, callback) {
  const complain = (err, code) => callback(null, complaint(err, code))

  const treeId = event.pathParameters.treeId

  if (!treeId.match(/^[a-z0-9_-]+$/i)) return complain('invalid treeId', 400)

  treesStore.queryTree(treeId, (err, tree) => {
    if (err) return complain(err, 500)

    if (!tree) return complain('tree not found', 404)

    if (tree.finished) {
      return treesStore.queryRequest(treeId, tree.id, (err, req) => {
        if (err) return complain(err, 500)

        callback(null, {
          statusCode: 200,
          headers: {
            'Content-Type': req.productType || 'application/json'
          },
          body: req.product
        })
      })
    }
    step(tree, event, (err, started) => {
      if (err) return console.error(err)

      callback(null, { statusCode: 202 }) // Accepted
    })
  })
}
