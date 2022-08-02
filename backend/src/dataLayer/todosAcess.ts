import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) {}

    async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
        logger.info(`Getting Todo ${todoId} from ${this.todosTable}`)
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            }
        }).promise()
	    logger.info(`todo item: ${result}`);
        return result.Item as TodoItem
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        logger.info(`Todos gotten as: ${result}`)
        return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Creating todo ${todo.name} at time: ${todo.createdAt}`)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo;
    }

    async updateTodo(todoId: string, todo: TodoUpdate, userId: string) {
        logger.info(`Updating todo ${todo.name} in table: ${this.todosTable}`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            },
            UpdateExpression: "SET #nm = :name, #dd = :dueDate, #d = :done",
            ExpressionAttributeValues: {
                ":dueDate": todo.dueDate,
                ":done": todo.done,
                ":name": todo.name
            },
            ExpressionAttributeNames: {
                '#nm': 'name',
                '#dd': 'dueDate',
                '#d': 'date'
            }
        }).promise()
    }

    async deleteTodo(todoId: string, userId: string) {
        logger.info(`Deleting todo with id: ${todoId} with table: ${this.todosTable}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            }
        }).promise()
    }

    async updateAttachmentUri(todoId: string, attachmentUrl: string, userId: string) {
        logger.info(`Updating Attachment uri of todo ${todoId} from table: ${this.todosTable}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId': userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            }
        }).promise()
    }
}
