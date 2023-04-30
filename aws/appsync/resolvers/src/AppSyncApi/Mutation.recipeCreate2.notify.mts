import { util, Context } from '@aws-appsync/utils';

export function request(ctx: Context) {
	return {
		operation: 'Invoke',
		payload: {
			id: ctx.prev.result,
		},
	};
}

export function response(ctx: Context) {
	const { error, result } = ctx;
	if (error) {
		console.log(JSON.stringify(error));
		return util.error(error.message, error.type, result);
	}
	return result;
}
