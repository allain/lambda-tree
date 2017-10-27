const test = require('tape')

const expand = require('../lib/expand-submission.js')

test('expandSubmission - request can be a string', t => {
  t.deepEqual(expand('http://a.com'), {
    request: {
      url: 'http://a.com'
    }
  })
  t.end()
})

test('expandSubmission - request prop can be submitted as string', t => {
  t.deepEqual(expand({ request: 'http://a.com' }), {
    request: {
      url: 'http://a.com'
    }
  })
  t.end()
})

test('expandSubmission - children are expanded too', t => {
  t.deepEqual(expand({ request: 'http://a.com', children: ['http://b.com'] }), {
    request: {
      url: 'http://a.com'
    },
    children: [
      {
        request: {
          url: 'http://b.com'
        }
      }
    ]
  })
  t.end()
})
