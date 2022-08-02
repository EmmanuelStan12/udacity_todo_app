import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils';
import { APIGatewayProxyEvent } from 'aws-lambda';

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new AttachmentUtils()

// TODO: Implement businessLogic
export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    event: APIGatewayProxyEvent
): Promise<TodoItem> {
    const todoId = uuid.v4();
    const userId = getUserId(event)

    return await todosAccess.createTodo({
        todoId,
        userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null
    })
}

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting all todos for ${userId}`)
    return await todosAccess.getAllTodos(userId)
}

export async function updateAttachmentUrl(todoId: string, attachmentId: string, userId: string) {
    logger.info(`updating attachment url: of id ${todoId}`)
    const todo = await todosAccess.getTodoItem(todoId, userId)

    if (!todo) {
        throw new Error('404: Resource not found')
    }
    if (todo.userId !== userId) {
        logger.error('Unauthorized to view this todo item')
        throw new Error('Unauthorized: 401')
    }
    const attachmentUrl = todosStorage.getAttachmentUrl(attachmentId)
    await todosAccess.updateAttachmentUri(todoId, attachmentUrl, userId)
}

export async function createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload url for ${attachmentId}`)
    const uploadUrl = todosStorage.getUploadUrl(attachmentId)

    return uploadUrl;
}

export async function updateTodo(userId: string, todoId: string, request: UpdateTodoRequest) {
    const todo = await todosAccess.getTodoItem(todoId, userId)
    if (!todo) {
        throw new Error('Todo does not exist')
    }

    if (todo.userId !== userId){
        logger.error('Unauthorized to view this todo item')
        throw new Error('Unauthorized: 401')
    }
    await todosAccess.updateTodo(todoId, {
        ...request
    }, userId)
}

export async function deleteTodo(todoId: string, userId: string) {
    const todo = await todosAccess.getTodoItem(todoId, userId);
    if (!todo) {
        throw new Error('404: Todo Not Found')
    }
    if (todo.userId !== userId) {
        logger.error('Unauthorized to delete this todo item')
        throw new Error('Unauthorized: 401')
    }
    logger.info('todo to be deleted: ', todo)
    await todosAccess.deleteTodo(todoId, userId)
}
