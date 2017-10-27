const test = require('tape')
const td = require('testdouble')
const clearAllRequires = require('clear-require').all

test('submitTree - handles invalid body', t => {
  const submitJob = require('../../../lib/lambda-functions/trees/submit.js')
    .post

  submitJob({ body: '{"not": "an array"}' }, {}, (err, result) => {
    t.error(err, 'no error')
    t.equal(result.statusCode, 400, 'should be an invalid http request')

    t.equal(typeof result.body, 'string')
    const body = JSON.parse(result.body)
    t.equal(body.statusCode, 400, 'should pass statusCode along in body')
    t.equal(
      body.error,
      'Missing required property: request',
      'should complain about missing request'
    )
    clearAllRequires()
    t.end()
  })
})

test.skip('submitTree - handle valid request without children', t => {
  const generateId = td.replace('../../../lib/generateId.js')
  td.when(generateId()).thenReturn(123, 234)

  const db = td.replace('../../../lib/db.js')
  const dbItems = [
    { id: 234, treeId: 123, request: { url: 'http://a.com' }, requested: 12345 }
  ]
  td
    .when(db.createAll('requests', dbItems, td.callback))
    .thenCallback(null, dbItems)

  const lambdaRequest = {
    headers: {
      Host: 'host.com'
    },
    path: '/submitpath',
    body: JSON.stringify({
      request: 'http://a.com',
      requested: 12345
    })
  }

  const submitTree = require('../../../lib/lambda-functions/trees/submit.js')
    .post

  submitTree(lambdaRequest, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should accept job')
    t.equal(typeof result.body, 'string', 'body should be a string')

    const body = JSON.parse(result.body)
    t.equal(body.statusCode, 200, 'should pass along status code in body')
    t.deepEqual(
      body.tree,
      {
        id: 123,
        url: 'http://host.com/submitpath/123'
      },
      'returns tree with proper structure'
    )
    clearAllRequires()
    t.end()
  })
})

test.skip('submitTree - handle valid request with children', t => {
  const generateId = td.replace('../../../lib/generateId.js')
  td.when(generateId()).thenReturn(123, 234, 345)

  const db = td.replace('../../lib/db.js')
  const dbItems = [
    {
      id: 234,
      treeId: 123,
      request: { url: 'http://a.com' },
      requested: 12345
    },
    {
      id: 345,
      treeId: 123,
      parentId: 234,
      request: { url: 'http://b.com' },
      requested: 12345
    }
  ]

  td
    .when(db.createAll('requests', dbItems, td.callback))
    .thenCallback(null, dbItems)

  const lambdaRequest = {
    body: JSON.stringify({
      request: 'http://a.com',
      requested: 12345,
      children: ['http://b.com']
    })
  }

  const submitRequest = require('../../trees/submit.js').post

  submitRequest(lambdaRequest, {}, (err, result) => {
    t.error(err, 'should not error')
    t.equal(result.statusCode, 200, 'should accept job')
    t.equal(typeof result.body, 'string', 'body should be a string')

    const body = JSON.parse(result.body)
    t.equal(body.statusCode, 200, 'should pass along status code in body')

    t.equal(body.treeId, 123, 'returns tree id')

    clearAllRequires()
    t.end()
  })
})
