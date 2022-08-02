import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'
import { createAttachmentPresignedUrl, updateAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const attachmentId = uuid.v4()
    const uploadUrl = await createAttachmentPresignedUrl(attachmentId)
    const userId = getUserId(event)

    await updateAttachmentUrl(todoId, attachmentId, userId);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
