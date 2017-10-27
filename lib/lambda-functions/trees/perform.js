const request = require('request')

const step = require('./_step.js')

const treesStore = require('../../stores/trees.js')
const relativeUrl = require('../../relative-url.js')
const now = require('../../now.js')

module.exports.get = function(event, context, callback) {
  const treeId = event.pathParameters.treeId
  if (!treeId.match(/^[a-z0-9_-]+$/i)) return complain('invalid treeId', 400)

  const requestId = event.pathParameters.requestId
  if (!requestId.match(/^[a-z0-9_-]+$/i))
    return complain('invalid requestId', 400)

  treesStore.queryBranch(treeId, requestId, (err, branch) => {
    if (err) return complain(err, 500)

    if (!branch) return complain('tree not found', 404)

    if (branch.product)
      return callback(null, {
        statusCode: 200,
        headers: {
          'Content-Type': branch.productType
        },
        body: branch.product
      })

    treesStore.updateRequest(treeId, requestId, { started: now() }, err => {
      if (err) return complain('Unable to record start of request:' + err, 500)

      const req = buildRequest(branch)

      console.log('requesting', req)
      request(req, (err, response, body) => {
        if (err) {
          return console.error(err)
        }

        treesStore.updateRequest(
          treeId,
          requestId,
          {
            product: body,
            productType: response.headers['content-type'] || 'application/json',
            finished: now()
          },
          err => {
            if (err) return console.error(err)

            const rootUrl = relativeUrl(event, '.')
            treesStore.queryTree(treeId, (err, tree) => {
              if (err) return console.error(err)

              step(tree, rootUrl, (err, started) => {
                if (err) return console.error(err)

                console.log('started ' + started + ' requests')
              })
            })
          }
        )
      })

      return callback(null, { statusCode: 202 }) // Accepted
    })
  })

  function buildRequest(branch) {
    const req = branch.request
    req.headers = Object.assign(req.headers || {}, {
      'x-id': branch.id,
      'x-tree-id': branch.treeId
    })

    if (branch.parentId) {
      req.headers['x-parent-id'] = branch.parentId
    }

    if (branch.children && branch.children.length) {
      req.method = 'POST'
      req.json = true
      req.body = branch.children.map(child => {
        const type = child.productType || 'application/json'

        return type.indexOf('application/json') === -1
          ? child.product
          : JSON.parse(child.product)
      })
    }
    return req
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
