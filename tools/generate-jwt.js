const jwt = require('jsonwebtoken')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

// Get document, or throw exception on error
let secrets
try {
  secrets = yaml.safeLoad(
    fs.readFileSync(path.join(__dirname, '..', 'secrets.yml'), 'utf8')
  )
} catch (e) {
  console.error(e)
  process.exit(1)
}

const client = process.argv[2] || 'anon'
console.log('Client:', client)

const token = jwt.sign(
  {
    iss: secrets.jwt.issuer,
    aud: secrets.jwt.audience,
    client
  },
  secrets.jwt.secret
)

console.log('TOKEN:', token)
