import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import * as AWS  from 'aws-sdk'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodo')
const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.INDEX_NAME


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const authorization = event.headers.Authorization 
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const result = await docClient.query({
    TableName : todosTable,
    IndexName : userIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': parseUserId(jwtToken)
    }
}).promise()

const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }


return {
  statusCode: 404,
  headers: {
    'Access-Control-Allow-Origin': '*'
  },
  body: ''
}
/*
  const result = await docClient.scan({
    TableName: todosTable
  }).promise()

  const items = result.Items;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
*/
}
