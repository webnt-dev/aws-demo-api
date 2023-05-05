```GraphQL
# Object representing ingredient
type Ingredient {
	# Ingredient name
	name: String!
	# Ingredient amount
	amount: Int!
	# Ingredient amount unit
	unit: String!
	# Ingredient image URL
	url: String
}

# Object representing ingredient
input IngredientInput {
	# Ingredient name
	name: String!
	# Ingredient amount
	amount: Int!
	# Ingredient amount unit
	unit: String!
}

type Mutation {
	# Create recipe by just inserting it to DynamoDB
	recipeCreate(input: RecipeCreateInput!): ID!
	# Create recipe by inserting it to DynamoDB and calling Lambda synchronously
	recipeCreate2(input: RecipeCreateInput!): RecipeCreate2!
	# Create recipe by inserting it to DynamoDB and calling Lambda asynchronously
	recipeCreate3(input: RecipeCreateInput!): ID!
	# Patch recipe (set new parameters)
	recipePatch(id: ID!, input: RecipePatchInput!): Boolean!
	# Delete recipe
	recipeDelete(id: ID!): Boolean!
}

type Query {
	# get one recipe based on ID (JavaScript resolver)
	recipeGetById(id: ID!): Recipe
	# get one recipe based on ID (VTL resolver)
	recipeGetById_vtl(id: ID!): Recipe
	# List recipes
	recipeList(input: RecipeListInput): RecipeList!
	# test duration of one VTL resolver (VTL templates)
	testVTL1: TestResult!
	# test duration of VTL resolver pipeline with 10 functions  (VTL templates)
	testVTL10: TestResult
	# test duration of JS resolver, pipeline with one JS function
	testJS1: TestResult!
	# test duration of JS resolver, pipeline with 10 JS functions
	testJS10: TestResult!
	# version query
	version: Version
}

# Object representing one recipe
type Recipe {
	# Cooking time in minutes
	cookingTime: Int!
	# Date and time of object creation
	created: AWSDateTime!
	# Recipe ID
	id: ID!
	# Recipe ingredients
	ingredients: [Ingredient!]!
	# Recipe name
	name: String!
	# Preparation time in minutes
	preparationTime: Int!
	# Date and time of last update
	updated: AWSDateTime!
}

type RecipeCreate2 {
	result: Boolean!
	id: ID!
}

# Object representing one recipe
input RecipeCreateInput {
	# Cooking time in minutes
	cookingTime: Int!
	# Recipe ingredients
	ingredients: [IngredientInput!]!
	# Recipe name
	name: String!
	# Preparation time in minutes
	preparationTime: Int!
}

type RecipeList {
	items: [Recipe!]!
	nextToken: String
}

# Listing filters
input RecipeListInput {
	# Listing count
	limit: Int
	# Listing token returned by function to list next page
	nextToken: String
}

# Object representing one recipe
input RecipePatchInput {
	# Cooking time in minutes
	cookingTime: Int
	# Recipe ingredients
	ingredients: [IngredientInput!]
	# Recipe name
	name: String
	# Preparation time in minutes
	preparationTime: Int
}

# test result type
type TestResult {
	# number of resolver templates / function templates
	count: Int!
	# ISO time of process end
	endTime: String!
	# time of process end in milliseconds
	endTimestamp: Long!
	# ISO time of process start
	startTime: String!
	# time of process start in milliseconds
	startTimestamp: Long!
	# duration in milliseconds
	time: Long!
}

# GraphQL version information
type Version {
	# API version publish date
	date: AWSDate!
	serverDateTime: AWSDateTime!
	# GraphQL version
	version: String!
}

schema {
	query: Query
	mutation: Mutation
}
```
