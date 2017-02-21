module.exports = expand

function expand (req) {
  if (typeof req === 'string')
    return { request: { url: req } }

  if (typeof req.request === 'string') {
    req.request = {
      url: req.request
    }
  }

  if (Array.isArray(req.children)) {
    req.children = req.children.map(c => expand(c))
  }

  return req
}
