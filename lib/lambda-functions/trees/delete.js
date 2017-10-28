const treesStore = require('../../stores/trees.js')
const complaint = require('../../http-utils/complaint')
module.exports.del = function(event, context, callback) {
  const treeId = event.pathParameters.treeId

  if (!treeId.match(/^[a-z0-9_-]+$/i))
    return callback(null, complaint('invalid treeId', 400))

  treesStore.deleteTree(treeId, (err, tree) => {
    if (err) return callback(null, complaint(err, 500))

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200
      })
    })
  })
}
