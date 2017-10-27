const test = require('tape')

const undone = require('../lib/undone.js')

test('undone - returns empty if root is completed', t => {
  undone({ id: 123, treeId: 234, finished: Date.now() }, (err, result) => {
    t.error(err, 'no error should be returned')
    t.ok(Array.isArray(result), 'result should an array')
    t.equal(result.length, 0, '0 items are undone')
    t.end()
  })
})

test('undone - returns all undone', t => {
  const tree = {
    id: 1,
    treeId: 234,
    children: [
      { id: 2, started: 123, finished: 234 },
      { id: 3, started: 125 },
      { id: 4 }
    ]
  }

  undone(tree, (err, result) => {
    t.error(err, 'no error should be returned')
    t.ok(Array.isArray(result), 'result should an array')
    t.equal(result.length, 2, '2 items are undone')

    // sort them so we are free to change the ordering internally
    result = result.sort((a, b) => a.id - b.id)
    t.equal(result[0].id, 3, 'started item is returned')
    t.equal(result[0].finished, undefined, 'finished is undefined')
    t.equal(result[1].id, 4, 'unstarted item is returned')
    t.equal(result[1].finished, undefined, 'finished is undefined')
    t.end()
  })
})

test('undone - omits parent nodes unless all children are done', t => {
  const tree = {
    id: 1,
    treeId: 234,
    children: [{ id: 2, started: 123, finished: 234 }]
  }

  undone(tree, (err, result) => {
    t.error(err, 'no error should be returned')
    t.ok(Array.isArray(result), 'result should an array')
    t.equal(result.length, 1, 'only root is undone')

    // sort them so we are free to change the ordering internally
    t.equal(result[0].id, 1, 'root item is undone')
    t.equal(result[0].started, undefined, 'started is undefined')
    t.equal(result[0].finished, undefined, 'finished is undefined')
    t.end()
  })
})
