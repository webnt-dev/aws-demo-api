import { util, Context } from '@aws-appsync/utils';

export function request(ctx: Context) {
	return {
		version: '2017-02-28',
		payload: {
			count: ctx.prev.result.count + 1,
			endTime: util.time.nowISO8601(),
			endTimestamp: util.time.nowEpochMilliSeconds(),
			startTime: ctx.prev.result.startTime,
			startTimestamp: ctx.prev.result.startTimestamp,
			time: util.time.nowEpochMilliSeconds() - ctx.prev.result.startTimestamp,
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
