import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { TodoStorage } from '../lambda/s3/TodoStorage'

const todoAccess = new TodoAccess()
const todoStorage = new TodoStorage()


export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todoAccess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<Object> {

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
    const userId = parseUserId(jwtToken)
    todoAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string,
    todoId: string
) {
    const userId = parseUserId(jwtToken)

    todoAccess.updateTodo(userId, updateTodoRequest, todoId)
}

export function generateUploadUrl(todoId: string) {
    return todoStorage.getUploadUrl(todoId)
}