import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

//import { CreateTodoRequest } from '../../requests/CreateTodoRequest'


const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const todoTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newtodoId = uuid.v4()
  const newItem = await createTodo( newtodoId, event)
  const url = getUploadUrl(newtodoId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: url
    })
  }
  // TODO: Implement creating a new TODO item
  return undefined
}


async function createTodo(newtodoId: string, event: any) {
  const timestamp = new Date().toISOString()
  const newTodo = JSON.parse(event.body)

  const newItem = {
    newtodoId,
    timestamp,
    ...newTodo,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${newtodoId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: todoTable,
      Item: newItem
    })
    .promise()

  return newItem
}



function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}