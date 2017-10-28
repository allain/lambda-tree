module.exports = (err, code) => ({
  statusCode: code,
  body: JSON.stringify({
    statusCode: code,
    error: '' + err
  })
})
