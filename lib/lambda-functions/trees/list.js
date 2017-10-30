const treesStore = require('../../stores/trees.js')
const relativeUrl = require('../../relative-url.js')

module.exports.get = function(event, context, callback) {
  treesStore.listTrees((err, trees) => {
    if (err) return complain(err, 500)

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        trees: trees.map(tree => {
          return Object.assign(tree, {
            treeUrl: relativeUrl(event, 'trees/' + tree.treeId)
          })
        })
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
