import { util } from '@aws-appsync/utils';

export function request() {
	return { };
}

export function response() {
	return {
		date: '2023-04-29',
		serverDateTime: util.time.nowISO8601(),
		version: '1.0.0',
	};
}
