import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const params = {
    TableName:todosTable,
    Key:{
        "todoId": todoId
    },
    UpdateExpression:"set #todo_name = :n, done = :d, dueDate = :dd",
    ExpressionAttributeValues:{
        ":n":updatedTodo.name,
        ":d":updatedTodo.done,
        ":dd":updatedTodo.dueDate
    },
    ExpressionAttributeNames:{
        "#todo_name": "name"
    }

  }

  await docClient.update(params).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
