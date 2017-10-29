const jwt = require('jsonwebtoken')

console.log('Loading jwtAuthorizer')

exports.handler = function(event, context, callback) {
  console.log('Received event', JSON.stringify(event, null, 2))

  if (!event.authorizationToken) return callback(new Error('unauthorized'))

  if (!event.authorizationToken.match(/^Bearer .*$/))
    return callback(new Error('unauthorized'))

  // remove the 'Bearer ' prefix from the auth token
  const token = event.authorizationToken.replace(/Bearer /g, '')

  // parse all API options from the event, in case we need some of them
  const apiOptions = getApiOptions(event)
  console.log('API Options', JSON.stringify(apiOptions, null, 2))

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
    } else {
      callback(null, allowPolicy(verified.sub, event.methodArn))
    }
  })
}

const getApiOptions = function(event) {
  const tmp = event.methodArn.split(':')
  const apiGatewayArnTmp = tmp[5].split('/')
  return {
    awsAccountId: tmp[4],
    region: tmp[3],
    restApiId: apiGatewayArnTmp[0],
    stageName: apiGatewayArnTmp[1]
  }
}

const denyPolicy = (principalId, resource) =>
  generatePolicy(principalId, 'Deny', resource)

const allowPolicy = (principalId, resource) =>
  generatePolicy(principalId, 'Allow', resource)

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {}
  authResponse.principalId = principalId
  if (effect && resource) {
    const policyDocument = {}
    policyDocument.Version = '2012-10-17' // default version
    policyDocument.Statement = []
    const statementOne = {}
    statementOne.Action = 'execute-api:Invoke' // default action
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }
  return authResponse
}
