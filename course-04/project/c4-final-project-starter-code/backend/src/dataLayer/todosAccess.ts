import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'


import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'


const logger = createLogger('todosAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.INDEX_NAME) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting todo items by user id')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Creating a new todo item')
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info('Deleting a todo item by todo id')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        let itemToSelect = -1;

        for (let i = 0; i < result.Items.length; i++) {
            if (result.Items[i]["todoId"] === todoId) {
                itemToSelect = i;
            }

        }

        if (itemToSelect !== -1) {
            // Remove a TODO item by id
            const params = {
                TableName: this.todosTable,
                Key: {
                    "todoId": todoId,
                    "createdAt": result.Items[itemToSelect]["createdAt"]
                }
            }
            await this.docClient.delete(params).promise()
        }

    }

    async updateTodo(userId: string, updateTodoRequest: UpdateTodoRequest, todoId: string) {
        logger.info('Updating a todo item by todo id')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        let itemToSelect = -1;
        for (let i = 0; i < result.Items.length; i++) {
            if (result.Items[i]["todoId"] === todoId) {
                itemToSelect = i;
            }
        }
        logger.info('itemToSelect: ', itemToSelect)
        // Update a TODO item with the provided id 
        const params = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "createdAt": result.Items[itemToSelect]["createdAt"]
            },
            UpdateExpression: "set #todo_name = :n, done = :d, dueDate = :dd",
            ExpressionAttributeValues: {
                ":n": updateTodoRequest.name,
                ":d": updateTodoRequest.done,
                ":dd": updateTodoRequest.dueDate
            },
            ExpressionAttributeNames: {
                "#todo_name": "name"
            }

        }
        //logger.info('params: ', params)
        await this.docClient.update(params).promise()
    

    }
}