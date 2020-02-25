import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId

  var params = {
    TableName: todoTable,
    Key: {
      todoId: todoId
    },
    ConditionExpression: 'todoId= :val',
    ExpressionAttributeValues: {
      ':val': todoId
    }
  }

  console.log('Attempting a conditional delete...')
  docClient.delete(params, function(err, data) {
    if (err) {
      console.error(
        'Unable to delete item. Error JSON:',
        JSON.stringify(err, null, 2)
      )
    } else {
      console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2))
    }
  })

  // TODO: Remove a TODO item by id
  return undefined
}
