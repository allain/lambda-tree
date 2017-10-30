const jwt = require('jsonwebtoken')

exports.handler = function(event, context, callback) {
  if (!event.authorizationToken) return callback(new Error('unauthorized'))
  if (!event.authorizationToken.match(/^Bearer .*$/))
    return callback(new Error('unauthorized'))

  // remove the 'Bearer ' prefix from the auth token
  const token = event.authorizationToken.replace(/Bearer /g, '')

  // config data to check the content of the token and public key to verify the signature of the token
  const config = {
    audience: process.env.TOKEN_AUDIENCE,
    issuer: process.env.TOKEN_ISSUER
  }
  const secret = process.env.TOKEN_SECRET

  // verify the token with publicKey and config and return proper AWS policy document
  jwt.verify(token, secret, config, (err, verified) => {
    if (err) {
      console.error('JWT Error', err, err.stack)
      callback(null, denyPolicy('anonymous', event.methodArn))
    } else if (!verified.client) {
      callback(null, denyPolicy('anonymous', event.methodArn))
    } else {
      callback(null, allowPolicy(verified.client, event.methodArn))
    }
  })
}

const denyPolicy = (principalId, resource) =>
  generatePolicy(principalId, 'Deny', resource)

const allowPolicy = (principalId, resource) =>
  generatePolicy(principalId, 'Allow', resource)

const generatePolicy = (principalId, effect, resource) =>
  Object.assign(
    { principalId },
    effect && resource
      ? {
          policyDocument: {
            Version: '2012-10-17', // default version
            Statement: [
              {
                Action: 'execute-api:Invoke', // default action
                Effect: effect,
                Resource: resource
              }
            ]
          }
        }
      : {}
  )
