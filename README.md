# aws-demo-api

![Architecture](./doc/aws-demo-api.drawio.png)

Repository contains AWS resources to create basic API demo application:

* AppSync GraphQL service
* Schema and resolvers for GraphQL
	* resolvers javaScript and VTL
	* direct resolvers (using VTL) and pipelines using JavaScript
	* JS resolvers validation (just commented example)
	* Connecting resolvers to
		* DynamoDB
		* Lambda
		* SQS
	* Testing VTL/JS 	resolvers/function time cost
	* Lambdas
	
## Configuration

### aws/config/sandbox.template.yml

Rename file to just `sandbox.yml` and fill your own information (region, client key, secret key).

Update paths for `lambdaSources`.

Bucked specified as `installBucketName` must already exists (cannot be created by this process).

### aws/stack/sandbox.yml

File contains the stack itself. File is commented to understand purpose of every resource.

## Installation

1. run `npm install` in all directories (aws, all lambda directories, tests)
2. you can install the stack from `aws` directory running `npm run sandbox`

### What does it do?

1. runs linters
2. compiles TS resolvers to JS
3. build CloudFormation template from resources (graphql, JS resolvers and VTL resolvers)
4. validates the template
5. created or updates stack
6. zips Lambdas code and copies those into installation bucket
7. update Lambdas code

### CF template building

CloudFormation requires certain data to be included in the template:
	* GraphQL schema for AppSync
	* Code for resolvers templates or function templates / codes

Code/schema directly included is hard to read, TS code cannot be processed (linting, building) and template 
becomes quite large.

`aws/stack/sandbox.yml` contains placeholders for such data that are filled by installation script.

#### AWS::AppSync::GraphQLSchema

GraphQL schema is build by joining together all files from `Definition` property

#### AWS::AppSync::Resolver (JS)

For JS: File referenced in `Code` is used
For VTL: Files referenced in `RequestMappingTemplate` and `ResponseMappingTemplate` are used

#### AWS::AppSync::FunctionConfiguration (JS)

For JS: File referenced in `Code` is used
For VTL: Files referenced in `RequestMappingTemplate` and `ResponseMappingTemplate` are used

## Lambdas

Lambdas are defined without source code (just with placeholder source code). 

`aws/config/sandbox.template.yml` contains Lambda resources code paths. Code in this path is zipped (into `aws` directory) and used
uploaded to installation bucket and used as source code (`UpdateFunctionCodeCommand`)


## Testing

### Manual

You can run queries against AppSync remotely (using `AppSync` -> <your appsync> -> `Settings` -> `API URL` as URL 
and keys (again at `Settings` page) as `x-api-key` header) 
or from console (using `AppSync` -> <your appsync> -> `Queries`)

Some test queries are located at `aws/appsync/demo/AppSyncApi`

### Automated test

Automated tests are located at `tests` folder

## API calls
[Description of API calls, what they do.](./doc/api.md)

