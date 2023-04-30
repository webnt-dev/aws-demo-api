import { util, Context } from '@aws-appsync/utils';

export function request(ctx: Context) {

	if (ctx.args.input.cookingTime < 0) {
		util.error('Cooking time must be bigger than 0.', 'ApiDemo::Recipe::Create::InvalidCookingTime');
	}

	if (ctx.args.input.preparationTime < 0) {
		util.error('Preparation time must be bigger than 0.', 'ApiDemo::Recipe::Create::InvalidPreparationTime');
	}

	ctx.args.input.name = ctx.args.input.name.trim();

	if (ctx.args.input.name === '') {
		util.error('Name cannot be empty.', 'ApiDemo::Recipe::Create::InvalidName');
	}

	return {
		version: '2018-05-29',
		operation: 'PutItem',
		key: util.dynamodb.toMapValues({ id: util.autoId() }),
		attributeValues: util.dynamodb.toMapValues({
			cookingTime: ctx.args.input.cookingTime,
			created: util.time.nowISO8601(),
			ingredients: ctx.args.input.ingredients,
			name: ctx.args.input.name,
			preparationTime: ctx.args.input.preparationTime,
			status: 'active',
			updated: util.time.nowISO8601(),
		}),
	};
}

export function response(ctx: Context) {
	const { error, result } = ctx;
	if (error) {
		console.log(JSON.stringify(error));
		return util.error(error.message, error.type, result);
	}
	return result.id;
}
