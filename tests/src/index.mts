import Config from './config';

function gql(chunks: TemplateStringsArray, ...variables: any[]): string {
	return chunks.reduce((accumulator, chunk, index) => `${accumulator}${chunk}${index in variables ? variables[index] : ''}`, '');
}

interface GraphQLParams {
	url: string;
	headers?: HeadersInit;
	query: string;
	operationName?: string;
	variables?: Record<string, any>;
}

interface GraphQLResponseError {
	message: string;
	errorType?: string;
}

interface GraphQLResponse {
	data: Record<string, any>;
	errors: GraphQLResponseError[];
}

interface GraphQLRequest {
	query: string;
	operationName?: string;
	variables?: Record<string, any>;
}


async function graphQL(params: GraphQLParams): Promise<GraphQLResponse> {

	const fetchInit: RequestInit = {
		method: 'POST',
	};
	if (params.headers) {
		fetchInit.headers = params.headers;
	}

	const body: GraphQLRequest = {
		query: params.query,
	};
	if (params.operationName) {
		body.operationName = params.operationName;
	}
	if (params.variables) {
		body.variables = params.variables;
	}
	fetchInit.body = JSON.stringify(body);
	return fetch(params.url, fetchInit).then((res) => res.json());
}

const URL = Config.API_URL;
const XApiKey = Config.API_KEY;

async function appGraphQL(params: Partial<GraphQLParams>): Promise<GraphQLResponse> {
	return graphQL({
		query: params.query ?? '',
		url: params.url ?? URL,
		headers: {
			...(params.headers ?? {}),
			'X-API-KEY': XApiKey,
		},
		variables: params.variables,
		operationName: params.operationName,
	});
}

const getRecipeById = (idName: string, prefix: string = ''): string => {
	if (prefix) {
		prefix +=": ";
	}
	return `
		${prefix}recipeGetById(id: ${idName}) {
			cookingTime
			created
			id
			ingredients {
				amount
				name
				unit
				url
			}
			name
			preparationTime
			updated
		}
	`;
}

interface Ingredient {
	name: string;
	amount: number;
	unit: string;
	url?: string;
}

interface Recipe {
	cookingTime: number;
	created?: string;
	id: string;
	ingredients: Ingredient[];
	name: string;
	preparationTime: number;
	updated?: string;
}

type RecipeKeys = keyof Recipe;
type IngredientKeys = keyof Ingredient;

const compareIngredient = (target: any, template: Ingredient) => {
	const keys = Object.keys(template) as Array<keyof typeof template>
	return (typeof target === 'object') &&
		(target !== null) &&
		keys.every((key: IngredientKeys) => {
			return (target[key] === template[key])
		});
}

const compareRecipe = (target: any, template: Recipe) => {
	const keys = Object.keys(template) as Array<keyof typeof template>
	let result = (typeof target === 'object') &&
		(target !== null) &&
		keys.every((key: RecipeKeys) => {
			return (target[key] === template[key]) || (key === 'ingredients')
		}) &&
		(target.ingredients.length === template.ingredients.length) &&
		template.ingredients.every((_: Partial<Ingredient>, index: number) => compareIngredient(target.ingredients[index], template.ingredients[index]))
	;

	return result;
}

describe('Recipes', () => {
	beforeAll(async () => {
	});

	afterAll(async () => {
	});

	test('Recipe GET', async () => {
		let resp;
		// let id;

		resp = await appGraphQL({
			query: gql`
				query ($input: ID!) {
					${getRecipeById('$input')}
				}
			`,
			variables: {
				input: 'c21aadd5-910b-49c8-8d75-1f3303c33a03',
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}

		expect(compareRecipe(resp.data?.recipeGetById, {
			cookingTime: 150,
			created: "2023-04-30T11:54:28.315Z",
			id: "c21aadd5-910b-49c8-8d75-1f3303c33a03",
			ingredients: [
					{
							amount: 1500,
							name: "Chicken meat & bones",
							unit: "g",
							url: "https://www.google.com/search?q=Chicken+meat+%26+bones"
					},
					{
							amount: 200,
							name: "Ginger",
							unit: "g",
							url: "https://www.google.com/search?q=Ginger"
					},
					{
							amount: 2,
							name: "Water",
							unit: "l",
							url: "https://www.google.com/search?q=Water"
					}
			],
			name: "Ramen",
			preparationTime: 30,
			updated: "2023-04-30T11:54:28.315Z"
		}));
	});

	test('CRUD + LIST', async () => {
		let resp;

		// CREATE
		resp = await appGraphQL({
			query: gql`
				mutation  {
					r1: recipeCreate(input: {
						cookingTime: 30,
						name: "XThai",
						preparationTime: 20,
						ingredients: [
							{amount: 250, name: "Pork rump", unit: "g"},
							{amount: 200, name: "Mushrooms", unit: "g"},
							{amount: 1, name: "Shallot", unit: "pcs"},
						]
					})

					r2: recipeCreate(input: {
						cookingTime: 10,
						name: "XSalmon",
						preparationTime: 2,
						ingredients: [
							{amount: 300, name: "Salmon", unit: "g"},
						]
					})

					r3: recipeCreate(input: {
						cookingTime: 1,
						name: "Test1",
						preparationTime: 2,
						ingredients: [
							{amount: 3, name: "TestI", unit: "pcs"},
						]
					})

				}
			`,

		});
		if (resp.errors) {
			console.error(resp.errors);
		}

		expect(resp.data?.r1.length).toBe(36);
		expect(resp.data?.r2.length).toBe(36);
		expect(resp.data?.r3.length).toBe(36);

		const ids = structuredClone(resp.data);

		// GET & COMPARE


		resp = await appGraphQL({
			query: gql`
				query ($id1: ID!, $id2: ID!, $id3: ID!) {
					${getRecipeById('$id1', 'r1')}
					${getRecipeById('$id2', 'r2')}
					${getRecipeById('$id3', 'r3')}
				}
			`,
			variables: {
				id1: ids.r1,
				id2: ids.r2,
				id3: ids.r3,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}

		expect(Object.keys(resp.data).length).toBe(3);

		expect(compareRecipe(resp.data?.r1, {
			id: ids.r1,
			cookingTime: 30,
			name: "XThai",
			preparationTime: 20,
			ingredients: [
				{ amount: 250, name: "Pork rump", unit: "g" },
				{ amount: 200, name: "Mushrooms", unit: "g" },
				{ amount: 1, name: "Shallot", unit: "pcs" },
			]
		}));
		expect(compareRecipe(resp.data?.r1, {
			id: ids.r2,
			cookingTime: 10,
			name: "XSalmon",
			preparationTime: 2,
			ingredients: [
				{amount: 300, name: "Salmon", unit: "g"},
			]
		}));
		expect(compareRecipe(resp.data?.r1, {
			id: ids.r3,
			cookingTime: 1,
			name: "Test1",
			preparationTime: 2,
			ingredients: [
				{amount: 3, name: "TestI", unit: "pcs"},
			]
		}));

		// PATCH
		resp = await appGraphQL({
			query: gql`
				mutation Patch($id: ID!) {
					recipePatch(
						id: $id,
						input: {
							cookingTime: 123,
							ingredients: [{amount: 7, name: "XTestI", unit: "ks"}],
							name: "New name",
							preparationTime: 456
						}
					)
				}
			`,
			variables: {
				id: ids.r1
			}

		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.recipePatch).toBe(true);


		// GET & COMPARE


		resp = await appGraphQL({
			query: gql`
				query ($id1: ID!) {
					${getRecipeById('$id1', 'r1')}
				}
			`,
			variables: {
				id1: ids.r1,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}

		expect(Object.keys(resp.data).length).toBe(1);

		expect(compareRecipe(resp.data?.r1, {
			id: ids.r1,
			cookingTime: 123,
			ingredients: [{amount: 7, name: "XTestI", unit: "ks"}],
			name: "New name",
			preparationTime: 456
		}));

		// DELETE (clean after yourself)
		resp = await appGraphQL({
			query: gql`
				mutation Delete($id1: ID!, $id2: ID!, $id3: ID!) {
					d1: recipeDelete(id: $id1)
					d2: recipeDelete(id: $id2)
					d3: recipeDelete(id: $id3)
				}
			`,
			variables: {
				id1: ids.r1,
				id2: ids.r2,
				id3: ids.r3,
			}

		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.d1).toBe(true);
		expect(resp.data?.d2).toBe(true);
		expect(resp.data?.d3).toBe(true);
	});


});
