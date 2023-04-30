import { util, Context, DynamoDBStringResult, DynamoDBNumberResult } from '@aws-appsync/utils';

export function request(ctx: Context) {

	if (!ctx.prev?.result) {
		util.error('Recipe not found.', 'FileModule::File::Patch::RecipeNotFound');
	}

	const patchExpression: string[] = [];
	const patchNames: Record<string, string> = {};
	const patchValues: Record<string, DynamoDBStringResult | DynamoDBNumberResult> = {};

	if (ctx.args.input.cookingTime) {
		if (ctx.args.input.cookingTime < 0) {
			util.error('Cooking time must be bigger than 0.', 'ApiDemo::Recipe::Patch::InvalidCookingTime');
		}
		patchExpression.push('#cookingTime = :cookingTime');
		patchNames['#cookingTime'] = 'cookingTime';
		patchValues[':cookingTime'] = util.dynamodb.toDynamoDB<number>(ctx.args.input.cookingTime);
	}

	if (ctx.args.input.preparationTime) {
		if (ctx.args.input.preparationTime < 0) {
			util.error('Preparation time must be bigger than 0.', 'ApiDemo::Recipe::Patch::InvalidPreparationTime');
		}
		patchExpression.push('#preparationTime = :preparationTime');
		patchNames['#preparationTime'] = 'preparationTime';
		patchValues[':preparationTime'] = util.dynamodb.toDynamoDB<number>(ctx.args.input.preparationTime);
	}

	if (ctx.args.input.name) {
		ctx.args.input.name = ctx.args.input.name.trim();
		if (ctx.args.input.name === '') {
			util.error('Name cannot be empty.', 'ApiDemo::Recipe::Patch::InvalidName');
		}
		patchExpression.push('#name = :name');
		patchNames['#name'] = 'name';
		patchValues[':name'] = util.dynamodb.toDynamoDB<string>(ctx.args.input.name);
	}

	if (patchExpression.length === 0) {
		util.error('Nothing to patch.', 'ApiDemo::Recipe::Patch::InvalidInput');
	}

	const dbRequest = {
		version: '2018-05-29',
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
		update: {
			expression: `SET ${patchExpression.join(',')}`,
			expressionNames: patchNames,
			expressionValues: patchValues,
		},
	};

	return dbRequest;
}

export function response(ctx: Context) {
	const { error, result } = ctx;
	if (error) {
		console.log(JSON.stringify(error));
		return util.error(error.message, error.type, result);
	}
	return true;
}
