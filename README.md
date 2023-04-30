# aws-demo-api

Repository contains AWS resources to create basic API demo application:

* AppSync GraphQL service
* Schema and resolvers for GraphQL

## Configuration

### aws/config/sandbox.template.yml

Rename file to just "sandbox.yml" and fill your own information (region, client key, secret key)

### aws/stack/sandbox.yml

File contains the stack itself

## Installation

1. run `npm install` in all directories (aws, all lambda directories, tests)
2. you can install the stack from `aws` directory running `npm run sandbox`

## Testing

### Manual

You can run queries against AppSync remotely (using `AppSync` -> <your appsync> -> `Settings` -> `API URL` as URL 
and keys (again at `Settings` page) as `x-api-key` header) 
or from console (using `AppSync` -> <your appsync> -> `Queries`)

Some test queries are located at `aws/appsync/demo/AppSyncApi`

### Automated test

Automated tests are located at `tests` folder
