const treesStore = require('../../stores/trees.js')

module.exports.del = function(event, context, callback) {
  const treeId = event.pathParameters.treeId
  if (!treeId.match(/^[a-z0-9_-]+$/i)) return complain('invalid treeId', 400)

  treesStore.deleteTree(treeId, (err, tree) => {
    if (err) return complain(err, 500)

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200
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
