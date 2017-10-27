const generateId = require('../generateId.js')
const assert = require('assert')
const db = require('../db.js')

module.exports = {
  queryBranch: (treeId, requestId, cb) => {
    assert(treeId, 'treeId not given')
    console.time('query for request')
    db.queryOne('requests', { treeId, id: requestId }, (err, request) => {
      console.timeEnd('query for request')
      if (err) return cb(err)

      console.time('query for children')
      db.queryAll(
        'requests',
        { treeId, parentId: requestId },
        ['id', 'product', 'productType'],
        (err, children) => {
          console.timeEnd('query for children')
          if (err) return cb(err)

          request.children = children
          cb(null, request)
        }
      )
    })
  },

  queryTree: (treeId, cb) => {
    assert(treeId, 'treeId not given')
    db.queryAll(
      'requests',
      { treeId },
      [
        'id',
        'treeId',
        'parentId',
        'requested',
        'started',
        'finished',
        'concurrency'
      ],
      (err, requests) => {
        if (err) return cb(err)

        const treeMap = requests.reduce((result, r) => {
          result[r.id] = r
          return result
        }, {})

        treeMap['root'] = { children: [] }

        requests.forEach(r => {
          const parent = treeMap[r.parentId || 'root']
          delete r.treeId
          delete r.parentId

          if (parent.children) {
            parent.children.push(r)
          } else {
            parent.children = [r]
          }
        })

        const root = treeMap.root.children[0]
        if (root) {
          root.treeId = treeId
        }

        cb(null, root)
      }
    )
  },

  deleteTree: (treeId, cb) => {
    db.queryAll('requests', { treeId }, ['id', 'treeId'], (err, requests) => {
      if (err) return cb(new Error('Unable to query for tree'))

      db.deleteAll('requests', requests, cb)
    })
  },

  createTree: (rootRequest, cb) => {
    const requests = buildRequestTree(rootRequest)
    db.createAll('requests', requests, (err, items) => {
      if (err) return cb(err)
      cb(null, items[0].treeId)
    })
  },

  queryRequest: (treeId, requestId, cb) => {
    db.queryOne('requests', { id: requestId, treeId }, cb)
  },

  updateRequest(treeId, requestId, props, cb) {
    this.queryRequest(treeId, requestId, (err, request) => {
      if (err) return cb(err)

      db.updateOne(
        'requests',
        { id: requestId, treeId },
        Object.assign(request, props),
        cb
      )
    })
  }
}

function buildRequestTree(rootRequest) {
  const result = []
  const treeId = generateId()
  const now = rootRequest.requested || Date.now()

  populateTreeItems(null, rootRequest)

  return result

  function populateTreeItems(parent, req) {
    const request = {
      id: req.id || generateId(),
      treeId,
      request: req.request,
      requested: now
    }

    if (parent) {
      request.parentId = parent ? parent.id : undefined
    }

    if (req.concurrency) {
      request.concurrency = req.concurrency
    }

    result.push(request)

    if (req.children) {
      req.children.forEach(child => populateTreeItems(request, child))
    }
  }
}
