import { util, Context } from '@aws-appsync/utils';

export function request() {
	return {
		version: '2017-02-28',
		payload: {
			count: 1,
			endTime: util.time.nowISO8601(),
			endTimestamp: util.time.nowEpochMilliSeconds(),
			startTime: util.time.nowISO8601(),
			startTimestamp: util.time.nowEpochMilliSeconds(),
			time: 0,
		},
	};
}

export function response(ctx: Context) {
	return {
		count: ctx.result.count + 1,
		endTime: util.time.nowISO8601(),
		endTimestamp: util.time.nowEpochMilliSeconds(),
		startTime: ctx.result.startTime,
		startTimestamp: ctx.result.startTimestamp,
		time: util.time.nowEpochMilliSeconds() - ctx.result.startTimestamp,
	};
}
