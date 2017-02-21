const url = require('url')

module.exports = relativeUrl

function relativeUrl(event, href) {
  // TODO: Make this use https if that's the protocol that was used
  const rootUrl = 'http://' + event.headers.Host + event.path
  return url.resolve(rootUrl, href)
}