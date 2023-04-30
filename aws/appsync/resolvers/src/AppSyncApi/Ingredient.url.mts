import { Context } from '@aws-appsync/utils';

export function request() {
	return { };
}

export function response(ctx: Context) {
	// you can use util.urlEncode function
	const name = ctx.source.name
		.replaceAll(' ', '+')
		.replaceAll('=', '%3D')
		.replaceAll('&', '%26')
		.replaceAll('#', '%23');
	return `https://www.google.com/search?q=${name}`;
}
