import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const itemId = uuid.v4()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization 
  const split = authorization.split(' ')
  const jwtToken = split[1]

  //a new TODO item to store
  const newItem = {
    userId: parseUserId(jwtToken),
    todoId: itemId,
    createdAt : new Date().toISOString(),
    ...newTodo,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  }

//item to return
  const item = {
    todoId: itemId,
    createdAt : new Date().toISOString(),
    ...newTodo,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item
    })
  }
}
