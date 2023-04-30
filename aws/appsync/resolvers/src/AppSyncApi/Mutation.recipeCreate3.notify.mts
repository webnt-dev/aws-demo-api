import { util, Context } from '@aws-appsync/utils';

export function request(ctx: Context) {
	const messageBody = util.urlEncode(JSON.stringify({ id: ctx.prev.result }));
	const body = `Action=SendMessage&Version=2012-11-05&MessageBody=${messageBody}`;

	return {
		method: 'POST',
		resourcePath: '/236511979300/apidemo-sandbox-notifynewrecipe2-sqs',
		params: {
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
			},
			body,
		},
	};
}

export function response(ctx: Context) {
	const { error, result, prev } = ctx;
	if (error) {
		console.log(JSON.stringify(error));
		return util.error(error.message, error.type, result);
	}
	return prev.result;
}
