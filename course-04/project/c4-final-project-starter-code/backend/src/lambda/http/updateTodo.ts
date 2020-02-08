import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as AWS  from 'aws-sdk'
//import { updateTodo } from '../../businessLogic/todos';
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.INDEX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)


  
 const result = await docClient.query({
   TableName : todosTable,
   IndexName : userIdIndex,
   KeyConditionExpression: 'userId = :userId',
   ExpressionAttributeValues: {
       ':userId': parseUserId(jwtToken)
   }
}).promise()

 let itemToSelect = -1;
 for(let i = 0; i < result.Items.length; i++){
   if(result.Items[i]["todoId"] === todoId){
     itemToSelect = i;
   }
 }

 if(itemToSelect === -1){
   
     return {
       statusCode: 404,
       headers: {
         'Access-Control-Allow-Origin': '*'
       },
       body: ''
     }
   
 }

 // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
 const params = {
   TableName:todosTable,
   Key:{
       "todoId": todoId,
       "createdAt": result.Items[itemToSelect]["createdAt"]
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

  // await updateTodo(updatedTodo, jwtToken, todoId);
 
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
