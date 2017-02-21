const treesStore = require('../../stores/trees.js')

module.exports.get = function (event, context, callback) {
  const treeId = event.pathParameters.treeId
  if (!treeId.match(/^[a-z0-9_-]+$/i))
    return complain('invalid treeId', 400)

  treesStore.queryTree(treeId, (err, tree) => {
    if (err) return complain(err, 500)

    if (!tree) return complain('tree not found', 404)

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        tree
      })
    }

    callback(null, response)
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
