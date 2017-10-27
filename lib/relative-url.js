const url = require('url')

module.exports = relativeUrl

function relativeUrl(event, href) {
  // TODO: Make this use https if that's the protocol that was used
  return event.isOffline || !event.requestContext
    ? url.resolve('http://' + event.headers.Host + event.path, href)
    : url.resolve(
        'https://' +
          event.headers.Host +
          '/' +
          event.requestContext.stage +
          event.path,
        href
      )
}
