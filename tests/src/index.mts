
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

const URL = 'https://4pf7jzo2gncgvlx4fbhnfp6xli.appsync-api.eu-central-1.amazonaws.com/graphql';
const XApiKey = 'da2-ydiou57qnvhhzjjlkmor3qoyhe';

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


describe('Files', () => {
	beforeAll(async () => {
	});

	afterAll(async () => {
	});


	const fileName = (new Date()).toISOString() + '.jpg';

	/* * /
	test('File create/get', async () => {
		let resp;
		let id;

		// CREATE
		resp = await appGraphQL({
			query: gql`
				mutation ($input: FileCreateInput!) {
					fileCreate(input: $input)
				}
			`,
			variables: {
				input: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "image/jpeg",
					name: fileName,
					path: "/dir1/dir2/dir3/dir5",
					size: 123456789
				},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileCreate.length).toBe(36);
		id = resp.data?.fileCreate;

		// GET
		resp = await appGraphQL({
			query: gql`
				query ($id: ID!) {
					fileGet(id: $id) {
						id
						idUser
						name
						path
						created
						lastModified
						mimeType
						size
					}
				}
			`,
			variables: {
				id,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileGet).toEqual({
			id,
			idUser: XApiKey,
			created: "2020-01-02T03:04:05Z",
			lastModified: "2020-01-03T03:04:05Z",
			mimeType: "image/jpeg",
			name: fileName,
			path: "/dir1/dir2/dir3/dir5",
			size: 123456789
		});

		// UPDATE
		resp = await appGraphQL({
			query: gql`
				mutation ($id: ID!, $input: FileUpdateInput!) {
					fileUpdate(id: $id, input: $input)
				}
			`,
			variables: {
				id,
				input: {
					lastModified: "2020-01-03T03:04:05Z",
					name: fileName + 'a',
					path: "/dir1/dir2/dir3/dir5/dir6",
					size: 12345678
				},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileUpdate).toBe(true);

		// GET
		resp = await appGraphQL({
			query: gql`
				query ($id: ID!) {
					fileGet(id: $id) {
						id
						idUser
						name
						path
						created
						lastModified
						mimeType
						size
					}
				}
			`,
			variables: {
				id,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileGet).toEqual({
			id,
			idUser: XApiKey,
			created: "2020-01-02T03:04:05Z",
			lastModified: "2020-01-03T03:04:05Z",
			mimeType: "image/jpeg",
			name: fileName + 'a',
			path: "/dir1/dir2/dir3/dir5/dir6",
			size: 12345678
		});


		// DELETE
		resp = await appGraphQL({
			query: gql`
				mutation ($id: ID!) {
					fileDelete(id: $id)
				}
			`,
			variables: {
				id,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		//expect(resp.data?.fileCreate.id).toBe('5198dad8-31de-4374-b6dd-0d541f926fcb');
		expect(resp.data?.fileDelete).toBe(true);

	});
	/* */

	/* * /
	test('File List', async () => {
		let resp: GraphQLResponse;

		// CREATE
		resp = await appGraphQL({
			query: gql`
				mutation ($input1: FileCreateInput!, $input2: FileCreateInput!, $input3: FileCreateInput!, $input4: FileCreateInput!, $input5: FileCreateInput!, $input6: FileCreateInput!) {
					fileCreate1: fileCreate(input: $input1)
					fileCreate2: fileCreate(input: $input2)
					fileCreate3: fileCreate(input: $input3)
					fileCreate4: fileCreate(input: $input4)
					fileCreate5: fileCreate(input: $input5)
					fileCreate6: fileCreate(input: $input6)

				}
			`,
			variables: {
				input1: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "image/jpeg",
					name: 'file1.jpg',
					path: "/dir1/dir2/dir3/dir5",
					size: 1
				},
				input2: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "image/jpeg",
					name: 'file2.jpg',
					path: "/dir1/dir2/dir3/dir5",
					size: 2
				},
				input3: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "text/plain",
					name: 'file1/txt',
					path: "/dir1/dir2",
					size: 3
				},
				input4: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "application/json",
					name: 'data.json',
					path: "/dir1/dir2",
					size: 4
				},
				input5: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "application/pdf",
					name: 'invoice.pfd',
					path: "/",
					size: 5
				},
				input6: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "application/json",
					name: 'dataX.json',
					path: "/dir1/dir2",
					size: 4
				},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		//console.log(resp.data);
		let ids = Object.keys(resp.data).map((key: String) => {
			return resp.data[key + ''];
		});
		expect(ids.length).toBe(6);

		// LIST
		resp = await appGraphQL({
			query: gql`
				query ($input1: FileListInput!, $input2: FileListInput!, $input3: FileListInput!, $input4: FileListInput!) {
					fileList1: fileList(input: $input1) {
						items {
							id
							idUser
							name
							path
							created
							lastModified
							mimeType
							size
						}
					}
					fileList2: fileList(input: $input2) {
						items {
							id
							idUser
							name
							path
							created
							lastModified
							mimeType
							size
						}
					}
					fileList3: fileList(input: $input3) {
						items {
							id
							idUser
							name
							path
							created
							lastModified
							mimeType
							size
						}
					}
					fileList4: fileList(input: $input4) {
						items {
							id
							idUser
							name
							path
							created
							lastModified
							mimeType
							size
						}
					}
				}
			`,
			variables: {
				input1: {path: "/dir1/dir2"},
				input2: {path: "/dir1/dir2/dir3/dir5"},
				input3: {path: "/"},
				input4: {path: "/dir1/dir2/"},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data.fileList1.items.length).toBe(3);
		expect(resp.data.fileList2.items.length).toBe(2);
		expect(resp.data.fileList3.items.length).toBe(1);
		expect(resp.data.fileList4.items.length).toBe(0);



		// DELETE
		resp = await appGraphQL({
			query: gql`
				mutation ($id1: ID!, $id2: ID!, $id3: ID!, $id4: ID!, $id5: ID!, $id6: ID!) {
					fileDelete1: fileDelete(id: $id1)
					fileDelete2: fileDelete(id: $id2)
					fileDelete3: fileDelete(id: $id3)
					fileDelete4: fileDelete(id: $id4)
					fileDelete5: fileDelete(id: $id5)
					fileDelete6: fileDelete(id: $id6)
				}
			`,
			variables: {
				id1: ids[0],
				id2: ids[1],
				id3: ids[2],
				id4: ids[3],
				id5: ids[4],
				id6: ids[5],
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}

		const result = Object.keys(resp.data).reduce((accumulator: Boolean, currentValue: String) => {
			return accumulator && resp.data[currentValue + ''];
		}, true);

		expect(result).toBe(true);
	});
	/* */

	/* */
	test('File upload', async () => {
		let resp;
		let id;

		// CREATE
		resp = await appGraphQL({
			query: gql`
				mutation ($input: FileCreateInput!) {
					fileCreate(input: $input)
				}
			`,
			variables: {
				input: {
					created: "2020-01-02T03:04:05Z",
					lastModified: "2020-01-03T03:04:05Z",
					mimeType: "image/jpeg",
					name: fileName,
					path: "/dir1/dir2/dir3/dir5",
					size: 123456789
				},
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileCreate.length).toBe(36);
		id = resp.data?.fileCreate;


		resp = await appGraphQL({
			query: gql`
				query ($id: ID!) {
					fileUploadLink(id: $id) {
						id
						url
					}
				}
			`,
			variables: {
				id
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		expect(resp.data?.fileUploadLink.id).toBe(id);

		console.log(resp.data?.fileUploadLink.url);

		// const buffer = Buffer.from('příliš žluťoučký kůň úpěl ďábelské ódy', 'utf-8');
		resp = await fetch(resp.data?.fileUploadLink.url, {
			method: "PUT",
			body: "příliš žluťoučký kůň úpěl ďábelské ódy"
		});

		console.log(resp.statusText);
		console.log(await resp.text());


		// DELETE
		resp = await appGraphQL({
			query: gql`
				mutation ($id: ID!) {
					fileDelete(id: $id)
				}
			`,
			variables: {
				id,
			},
		});
		if (resp.errors) {
			console.error(resp.errors);
		}
		//expect(resp.data?.fileCreate.id).toBe('5198dad8-31de-4374-b6dd-0d541f926fcb');
		expect(resp.data?.fileDelete).toBe(true);

	});
	/* */

});
