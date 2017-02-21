const test = require('tape')
const td = require('testdouble')
const clearAllRequires = require('clear-require').all

test('resultTree - handles invalid id', t => {
  td.reset()

  const resultTree = require('../../../lib/lambda-functions/trees/result.js').get

  const event = {
    pathParameters: {
      treeId: '......'
    }
  }

  resultTree(event, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 400, 'Invalid Request should be emitted')
    clearAllRequires()
    t.end()
  })
})

test('resultTree - handle valid request for unknown tree', t => {
  const treesStore = td.replace('../../../lib/stores/trees.js')
  td.when(treesStore.queryTree('404', td.callback)).thenCallback(null, null)

  const resultTree = require('../../../lib/lambda-functions/trees/result.js').get

  const request = { pathParameters: { treeId: '404' } }

  resultTree(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 404, 'should 404')
    clearAllRequires()
    t.end()
  })
})

test('resultTree - does nothing when entire tree is completed', t => {
  td.reset()
  const trees = td.replace('../../../lib/stores/trees.js')

  td.when(trees.queryTree('123', td.callback))
    .thenCallback(null, {
      id: '234',
      treeId: '123',
      started: 12344,
      finished: 12345
    })

  td.when(
    trees.queryRequest('123', '234', td.callback)
  ).thenCallback(null, {
    id: '234',
    treeId: '123',
    requested: 12345,
    started: 12350,
    finished: 12360,
    product: '"Testing"',
    productType: 'application/json'
  })

  const resultTree = require('../../../lib/lambda-functions/trees/result.js').get

  const request = { pathParameters: { treeId: '123' } }

  resultTree(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should 200')

    const response = JSON.parse(result.body)
    t.deepEqual(response, 'Testing')
    clearAllRequires()
    t.end()
  })
})

test('resultTree - does nothing when root is started recently', t => {
  td.reset()

  const now = Date.now()
  const trees = td.replace('../../../lib/stores/trees.js')

  td.when(trees.queryTree('123', td.callback)).thenCallback(null,
    {
      id: '234',
      treeId: '123',
      requested: now - 10, // 10ms ago
      started: now - 5 // 5ms ago
    }
  )

  const resultTree = require('../../../lib/lambda-functions/trees/result.js').get

  const request = {
    headers: {
      'Host': 'a.com'
    },
    pathParameters: { treeId: '123' },
    path: '/trees/123'
  }

  resultTree(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 202, 'should HTTP 202 Accepted when processing is not completed')

    t.equal(result.body, undefined, 'body should be empty when things are not completed')
    // TODO: clearAllRequires()
    t.end()
  })

})
