const treesStore = require('../../../lib/stores/trees.js')
const undone = require('../../undone.js')
const request = require('request')

module.exports = step

function step(tree, rootUrl, callback) {
  undone(tree, (err, undoneRequests) => {
    if (err) callback(err)

    const concurrency = tree.concurrency || 1

    if (undoneRequests.length === 0) {
      return callback(null, 0)
    }

    const startedRequests = undoneRequests.filter(r => r.started)
    const unstartedRequests = undoneRequests.filter(r => !r.started)

    var started = 0
    while (startedRequests.length < concurrency) {
      const req = unstartedRequests.pop()
      startedRequests.push(req)
      started++

      const performUrl = rootUrl + req.id
      request(performUrl, (err, response) => {
        if (err) return console.error(err)
      })
    }

    callback(null, started)
  })
}
