import { util, Context } from '@aws-appsync/utils';

export function request(ctx: Context) {

	if (!ctx.args.id) {
		util.error('Id cannot be empty string.', 'ApiDemo::Recipe::GetById::InvalidId');
	}

	return {
		version: '2018-05-29',
		operation: 'GetItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
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
