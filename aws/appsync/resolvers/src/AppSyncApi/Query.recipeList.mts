import { util, Context, DynamoDBQueryRequest } from '@aws-appsync/utils';

export function request(ctx: Context) {

	const dbRequest = {
		version: '2018-05-29',
		operation: 'Query',
		index: 'status-created-index',
		query: {
			expression: '#status = :status',
			expressionNames: {
				'#status': 'status',
			},
			expressionValues: {
				':status': util.dynamodb.toDynamoDB('active'),
			},
		},
		scanIndexForward: false,
	} as DynamoDBQueryRequest;
	if (ctx.args.input) {
		if (ctx.args.input.nextToken) {
			dbRequest.nextToken = ctx.args.input.nextToken;
		}
		if (ctx.args.input.limit) {
			dbRequest.limit = ctx.args.input.limit;
		}
	}

	return dbRequest;
}

export function response(ctx: Context) {
	const { error, result } = ctx;
	if (error) {
		console.log(JSON.stringify(error));
		return util.error(error.message, error.type, result);
	}

	return result;
}
