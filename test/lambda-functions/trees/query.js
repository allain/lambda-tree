const test = require('tape')
const td = require('testdouble')
const clearAllRequires = require('clear-require').all

test('queryTree - handles invalid id', t => {
  const queryTree = require('../../../lib/lambda-functions/trees/query.js').get

  const event = {
    pathParameters: {
      treeId: '......'
    }
  }

  queryTree(event, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 400, 'Invalid Request should be emitted')
    t.end()
  })
})

test('queryTree - handle valid request for unknown tree', t => {
  td.reset()

  const treesStore = td.replace('../../../lib/stores/trees.js')
  td.when(treesStore.queryTree('404', td.callback)).thenCallback(null, null)

  const queryTree = require('../../../lib/lambda-functions/trees/query.js').get

  const request = { pathParameters: { treeId: '404' } }

  queryTree(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 404, 'should 404')
    td.reset()
    t.end()
  })
})

test('queryTree - handle valid request for known tree', t => {
  td.reset()

  const tree = {
    id: '123',
    requested: 12345,
    children: [
      {
        requested: 12345,
        id: '234'
      }
    ]
  }

  const treesStore = td.replace('../../../lib/stores/trees.js')
  td.when(treesStore.queryTree('here', td.callback)).thenCallback(null, tree)

  const queryTree = require('../../../lib/lambda-functions/trees/query.js').get

  const request = { pathParameters: { treeId: 'here' } }

  queryTree(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should 200')

    const response = JSON.parse(result.body)
    t.deepEqual(response.tree, tree)
    td.reset()
    t.end()
  })
})
