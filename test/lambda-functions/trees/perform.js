const test = require('tape')
const td = require('testdouble')
const clearAllRequires = require('clear-require').all

test('perform - handles invalid treeId', t => {
  const perform = require('../../../lib/lambda-functions/trees/perform.js').get

  const event = {
    pathParameters: {
      treeId: '....',
      requestId: '123'
    }
  }

  perform(event, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 400, 'Invalid Request should be emitted')
    t.end()
  })
})

test('perform - handles invalid requestId', t => {
  const perform = require('../../../lib/lambda-functions/trees/perform.js').get

  const event = {
    pathParameters: {
      treeId: '123',
      requestId: '.....'
    }
  }

  perform(event, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 400, 'Invalid Request should be emitted')
    t.end()
  })
})

test.skip('perform - handle valid request for unknown tree', t => {
  td.reset()

  const treesStore = td.replace('../../lib/stores/trees.js')
  td.when(treesStore.queryTree('404', td.callback)).thenCallback(null, null)

  const perform = require('../../trees/perform.js').get

  const request = { pathParameters: { treeId: '404', requestId: '404' } }

  perform(request, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 404, 'should 404')
    td.reset()
    t.end()
  })
})

test('perform - performs root request when doable', t => {
  td.reset()

  const now = td.replace('../../../lib/now.js')
  td.when(now()).thenReturn(12345, 12346)

  const trees = td.replace('../../../lib/stores/trees.js')

  const request = td.replace('request')
  const requestOptions = {
    url: 'http://www.testing.com',
    method: 'POST',
    json: true,
    headers: {
      'content-type': 'application/json',
      'x-id': 'parent',
      'x-tree-id': '123'
    },
    body: '["Child"]'
  }
  td.when(request(requestOptions, td.callback)).thenCallback(null, {
    statusCode: 200
  }, 'Parent Body')

  td.when(trees.updateRequest('123', 'parent', { product: '"Parent Body"', productType: 'application/json' }, td.callback))
    .thenCallback(null)
  td.when(trees.updateRequest('123', 'parent', { started: 12345 }, td.callback))
    .thenCallback(null)
  td.when(trees.updateRequest('123', 'parent', { finished: 12346 }, td.callback))
    .thenCallback(null)

  td.when(
    trees.queryBranch('123', 'parent', td.callback)
  ).thenCallback(null,
    {
      id: 'parent',
      treeId: '123',
      request: { url: 'http://www.testing.com' },
      children: [
        { id: 'child', product: '"Child"', productType: 'application/json' }
      ]
    }
    )

  const perform = require('../../../lib/lambda-functions/trees/perform.js').get

  perform({ pathParameters: { treeId: '123', requestId: 'parent' } }, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 202, 'Should HTTP 202 Accepted')

    t.equal(result.body, undefined, 'body should be empty')

    // allow the request call to be made
    setTimeout(() => {
      t.equal(td.explain(request).callCount, 1, 'request should be called')

      clearAllRequires()
      t.end()
    }, 100)
  })
})
