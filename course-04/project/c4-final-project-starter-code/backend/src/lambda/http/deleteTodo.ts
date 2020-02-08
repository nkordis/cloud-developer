import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos';

//import * as AWS from 'aws-sdk'
//import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
//const docClient = new AWS.DynamoDB.DocumentClient()
//const todosTable = process.env.TODOS_TABLE
//const userIdIndex = process.env.INDEX_NAME


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const todoId = event.pathParameters.todoId

  /*
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: userIdIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': parseUserId(jwtToken)
    }
  }).promise()

  
  let itemToSelect = -1;
  if (result.Count !== 0) {
    for (let i = 0; i < result.Items.length; i++) {
      if (result.Items[i]["todoId"] === todoId) {
        itemToSelect = i;
      }
    }

    if (itemToSelect === -1) {

      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }

    }
    // TODO: Remove a TODO item by id
    const params = {
      TableName: todosTable,
      Key: {
        "todoId": todoId,
        "createdAt": result.Items[itemToSelect]["createdAt"]
      }
    }
    await docClient.delete(params).promise()
    */

    await deleteTodo(jwtToken, todoId);

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }

  /*

  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }*/

}
