import { util } from '@aws-appsync/utils';

export function request() {
	return { };
}

export function response() {
	return {
		date: '2023-05-05',
		serverDateTime: util.time.nowISO8601(),
		version: '1.1.0',
	};
}
