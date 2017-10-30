const undone = require('../../undone.js')
const request = require('request')
const relativeUrl = require('../../relative-url')

module.exports = step

function step(tree, event, callback) {
  console.log(event)
  const rootUrl = relativeUrl(event, '/trees/' + tree.treeId + '/')

  undone(tree, (err, undoneRequests) => {
    if (err) return callback(err)

    console.log('undone requests', undoneRequests)

    const concurrency = tree.concurrency || 1

    if (undoneRequests.length === 0) {
      return callback(null, 0)
    }

    const startedRequests = undoneRequests.filter(r => r.started)
    const unstartedRequests = undoneRequests.filter(r => !r.started)

    var started = 0
    while (unstartedRequests.length && startedRequests.length < concurrency) {
      const req = unstartedRequests.pop()
      startedRequests.push(req)
      started++

      const performUrl = rootUrl + req.id
      request(
        {
          url: performUrl,
          headers: {
            Host: event.headers.Host,
            Authorization: event.headers.Authorization
          }
        },
        (err, response) => {
          if (err) return console.error(err)
        }
      )
    }

    callback(null, started)
  })
}
