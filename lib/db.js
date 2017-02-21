const AWS = require('aws-sdk')
const convert = require('dynamo-converter')

const dynamo = new AWS.DynamoDB({ 'region': 'us-east-1' })

module.exports = {
  createAll,
  queryAll,
  queryOne,
  deleteAll,
  updateOne
}

function createAll(tableName, items, cb) {
  const requestItems = {}
  requestItems[tableName] = items.map(item => ({
    PutRequest: {
      Item: convert.toItem(item)
    }
  }))

  dynamo.batchWriteItem({
    RequestItems: requestItems
  }, (err, data) => {
    if (err) return cb(err)

    cb(null, items)
  })
}

function deleteAll(tableName, itemKeys, cb) {
  // request to delete nothing is treated as a success
  if (itemKeys.length === 0) return cb()

  const requestItems = {}
  requestItems[tableName] = itemKeys.map(item => ({
    DeleteRequest: {
      Key: convert.toItem(item)
    }
  }))

  dynamo.batchWriteItem({
    RequestItems: requestItems
  }, (err, data) => {
    if (err) return cb(err)

    cb()
  })
}

function queryAll(tableName, conditions, fields, cb) {
  const filterExpression = Object.keys(conditions).map(prop => prop + ' =:' + prop).join(' AND ')
  const projectionExpression = fields.join(',')
  const expressionAttributeValues = convert.toItem(Object.keys(conditions).reduce((result, prop) => {
    result[':' + prop] = conditions[prop]
    return result
  }, {}))

  var params = {
    ExpressionAttributeValues: expressionAttributeValues,
    FilterExpression: filterExpression,
    ProjectionExpression: projectionExpression,
    TableName: tableName
  }

  // since scans can be paginated this is required
  var items = []

  function scanExecute(callback) {
    dynamo.scan(params, function (err, result) {
      if (err) return callback(err)

      items = items.concat(result.Items)

      if (result.LastEvaluatedKey) {
        // More items remain
        params.ExclusiveStartKey = result.LastEvaluatedKey
        scanExecute(callback)
      } else {
        callback(err, items.map(item => convert.fromItem(item)))
      }
    })
  }

  scanExecute(cb)
}

function queryOne(tableName, key, cb) {
  const params = {
    TableName: tableName,
    Key: convert.toItem(key),
    ConsistentRead: true,
  }

  // since scans can be paginated this is required
  dynamo.getItem(params, function (err, result) {
    if (err) return cb(err)

    cb(null, convert.fromItem(result.Item))
  })
}

function updateOne(tableName, key, props, cb) {
  const conditionExpression = Object.keys(key).map(prop => prop + ' =:' + prop).join(' AND ')
  const expressionAttributeValues = convert.toItem(Object.keys(key).reduce((result, prop) => {
    result[':' + prop] = key[prop]
    return result
  }, {}))

  const params = {
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: conditionExpression,
    Item: convert.toItem(props),
    TableName: tableName
  }

  dynamo.putItem(params, cb)
}
