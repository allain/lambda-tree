const test = require('tape')
const td = require('testdouble')
const clearAllRequires = require('clear-require').all

test('deleteTree - handles invalid id', t => {
  const deleteTree = require('../../../lib/lambda-functions/trees/delete.js').del

  const event = {
    pathParameters: {
      treeId: '......'
    }
  }
  const context = {}

  deleteTree(event, context, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 400, 'Invalid Request should be emitted')
    t.end()
  })
})

test('deleteTree - handle valid request for unknown tree', t => {
  td.reset()

  const treesStore = td.replace('../../../lib/stores/trees.js')
  td.when(treesStore.deleteTree('404', td.callback)).thenCallback(null, null)

  const deleteTree = require('../../../lib/lambda-functions/trees/delete.js').del

  const request = { pathParameters: { treeId: '404' } }
  const context = {}

  deleteTree(request, context, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should 200 OK')
    td.reset()
    t.end()
  })
})

test('deleteTree - does delete tree', t => {
  td.reset()

  const treesStore = td.replace('../../../lib/stores/trees.js')
  td.when(treesStore.deleteTree('found', td.callback)).thenCallback(null, true)

  const deleteTree = require('../../../lib/lambda-functions/trees/delete.js').del

  const request = { pathParameters: { treeId: 'found' } }
  const context = {}

  deleteTree(request, context, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should 200')
    td.reset()
    t.end()
  })
})
