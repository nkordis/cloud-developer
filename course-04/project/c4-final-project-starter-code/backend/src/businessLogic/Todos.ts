import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoStorage } from '../lambda/s3/TodoStorage'

const logger = createLogger('todosBusinessLogic')
const todoAccess = new TodoAccess()
const todoStorage = new TodoStorage()


export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    logger.info('Request todo items by user id')
    const userId = parseUserId(jwtToken)
    return todoAccess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<Object> {
    logger.info('Request to creat a new todo item')
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
    const bucketName = todoStorage.getBucketName();

    //a new TODO item to store
    const newItem = {
        userId: userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        ...createTodoRequest,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    }

    await todoAccess.createTodo(newItem)

    //item to return
    const item = {
        todoId: itemId,
        createdAt: new Date().toISOString(),
        ...createTodoRequest,
        done: false,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    }

    return item
}

export async function deleteTodo(jwtToken: string, todoId: string) {
    logger.info('Request to delete a todo item by todo id')

    const userId = parseUserId(jwtToken)
    todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string,
    todoId: string
) {
    logger.info('Request to update a todo item by todo id')
    const userId = parseUserId(jwtToken)

    todoAccess.updateTodo(userId, updateTodoRequest, todoId)
}

export function generateUploadUrl(todoId: string) {
    logger.info('Request a url to upload the bucket')
    
    return todoStorage.getUploadUrl(todoId)
}