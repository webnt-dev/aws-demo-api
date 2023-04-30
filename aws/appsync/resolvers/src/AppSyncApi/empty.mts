import { Context } from '@aws-appsync/utils';

export function request() {
	return { };
}

export function response(ctx: Context) {
	return ctx.prev.result;
}
