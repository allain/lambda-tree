module.exports = undone

function undone (root, cb) {
  const nodes = []
  walkTree(root, (node) => {
    if (!node.finished) {
      const doable = !(node.children || []).find(n => !n.finished)
      if (doable) {
        nodes.push(node)
      }
    }
  })

  return cb(null, nodes)
}

function walkTree (node, iter) {
  var current = [node]
  var n
  while (n = current.pop()) {
    iter(n)
    current = current.concat(n.children || [])
  }
}
