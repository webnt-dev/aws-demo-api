
let Config = {
	API_KEY: 'YOUR API KEY',
	API_URL: 'GRAPHQL ENDPOINT',
};


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
				inputx: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "image/jpeg",
					name: 'fileName',
					path: "/dir1/dir2/dir3/dir5",
					size: 123456789
				},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		// console.log(resp.data?.recipeGetById.ingredients);
		expect(resp.data?.recipeGetById.cookingTime).toBe(150);
		expect(resp.data?.recipeGetById.created).toBe('2023-04-30T11:54:28.315Z');
		expect(resp.data?.recipeGetById.id).toBe('c21aadd5-910b-49c8-8d75-1f3303c33a03');
		expect(resp.data?.recipeGetById.name).toBe('Ramen');
		expect(resp.data?.recipeGetById.preparationTime).toBe(30);
		expect(resp.data?.recipeGetById.updated).toBe('2023-04-30T11:54:28.315Z');

		expect(resp.data?.recipeGetById.ingredients[0].amount).toBe(1500);
		expect(resp.data?.recipeGetById.ingredients[0].name).toBe('Chicken meat & bones');
		expect(resp.data?.recipeGetById.ingredients[0].unit).toBe('g');
		expect(resp.data?.recipeGetById.ingredients[0].url).toBe('https://www.google.com/search?q=Chicken+meat+%26+bones');

		expect(resp.data?.recipeGetById.ingredients[1].amount).toBe(200);
		expect(resp.data?.recipeGetById.ingredients[1].name).toBe('Ginger');
		expect(resp.data?.recipeGetById.ingredients[1].unit).toBe('g');
		expect(resp.data?.recipeGetById.ingredients[1].url).toBe('https://www.google.com/search?q=Ginger');

		expect(resp.data?.recipeGetById.ingredients[2].amount).toBe(2);
		expect(resp.data?.recipeGetById.ingredients[2].name).toBe('Water');
		expect(resp.data?.recipeGetById.ingredients[2].unit).toBe('l');
		expect(resp.data?.recipeGetById.ingredients[2].url).toBe('https://www.google.com/search?q=Water');
	});


});
