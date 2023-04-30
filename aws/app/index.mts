// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cloudformation/index.html
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-listing-event-history.html
// https://stackoverflow.com/questions/71898650/how-to-work-with-logging-and-progress-bar-in-a-node-js-cli-application

/**
 * @todo place path to labda dir to AWS::Serverless::Function ???? but where?
 */

import fs from 'node:fs/promises';
import {
	CloudFormationClientConfig,
	CloudFormationClient,
	ValidateTemplateCommand,
	CreateStackCommand, UpdateStackCommand, DescribeStacksCommand, CloudFormationServiceException,
	waitUntilStackUpdateComplete,
	// StackStatus,
	// DescribeStackEventsCommand,
	// StackEvent,
} from '@aws-sdk/client-cloudformation';

import {
	S3Client, S3ClientConfig,
	PutObjectCommand, PutObjectCommandInput,
	HeadObjectCommand, HeadObjectCommandInput,
	/* DeleteObjectCommand, DeleteObjectCommandInput */
} from '@aws-sdk/client-s3';
import {
	LambdaClient,
	// ListFunctionsCommand, ListFunctionsCommandInput,
	UpdateFunctionCodeCommand, UpdateFunctionCodeCommandInput,
} from '@aws-sdk/client-lambda';
import YAML from 'yaml';
import glob from 'glob';
// @ts-ignore
import zipFolder from 'zip-folder';
import * as crc from 'crc';


const stackReg = /--config=([^\s]*)/;
const stack = process.argv.filter((param: string) => stackReg.test(param)).map((param: string) => stackReg.exec(param)?.[1]);

if (stack.length !== 1) {
	console.log('Either no config or too many');
}

/* **********************
 * config name to run
 ********************** */
const CFG_NAME = `./config/${stack[0]}.yml`;

interface CFConfig {
	templateFile: string;
	awsConfig: CloudFormationClientConfig;
	installBucketName: string;
	projectName: string;
	enviroment: string;
	stackName: string;
	lambdaSources: Record<string, string>;
}

const config = YAML.parse((await fs.readFile(CFG_NAME)).toString('utf-8')) as CFConfig;
const yamlTemplateFile = config.templateFile;
const awsConfig = config.awsConfig;
const bucketName = config.installBucketName;
const projectName = config.projectName;
const enviroment = config.enviroment;
const stackName = config.stackName;
const lambdaSources = config.lambdaSources;

function logError(err: any) {
	let message = '';
	if (err instanceof Error) {
		message = err.message;
	} else {
		message = err.toString();
	}
	console.error((new Date()).toISOString(), 'ERROR:', message);
}

function logInfo(message: any) {
	console.log((new Date()).toISOString(), 'INFO:', message);
}

interface CFTemplate {
	Resources: {
		[key: string]: {
			Type: string;
			Properties: {
				Code: string;
				Definition: string;
				Runtime?: {
					Name?: string;
				},
				RequestMappingTemplate?: string;
				ResponseMappingTemplate?: string;
			}
		}
	}
}

/**
 * promisified GLOB
 */
const pglob = async (path: string): Promise<string[]> => new Promise((resolve, reject) => {
	glob(path, (err, files) => {
		if (err) {
			reject(err);
		}
		resolve(files);
	});

});

/**
 * stitch together all graphQL files in glob path into one string
 */
const getGraphQlSchema = async (schemaPath: string) => {
	const graphqlFiles = await pglob(schemaPath);
	const gql = (await Promise.all(graphqlFiles.map((f) => fs.readFile(f, { encoding: 'utf-8' })))).reduce((previous, current) => `${previous}\n${current}`);
	return gql;
};


logInfo(`Parsing ${yamlTemplateFile}`);
let templateBody = (await fs.readFile(yamlTemplateFile)).toString('utf-8');
const template = YAML.parse(templateBody) as CFTemplate;


logInfo('Creating GraphQL definition');

interface AppSyncCode {
	key: string;
	path: string;
}
/**
 * find all AWS::AppSync::GraphQLSchema resorces and read resource name and Definition (path do dir is in Definition, see stack*.yml)
 */
const allAppSyncKeys: AppSyncCode[] = [];
Object.keys(template.Resources).forEach(async (key) => {
	const cfResource = template.Resources[key];
	if (cfResource.Type === 'AWS::AppSync::GraphQLSchema') {
		allAppSyncKeys.push({
			key,
			path: cfResource.Properties.Definition,
		});
	}
});

/**
 * stitch related definitions together and put them into GraphQLSchema's Definition
 */
const stiched = await Promise.all(allAppSyncKeys.map((key) => getGraphQlSchema(key.path)));
allAppSyncKeys.forEach((key, index) => {
	template.Resources[key.key].Properties.Definition = stiched[index];
});


logInfo('Creating resolvers and functions definition');

/**
 * find all resolver & resolver functions, (path to code is in Code, see stack*.yml)
 */
const allJSResolverKeys: string[] = [];
const allJSResolverFiles: Promise<string>[] = [];
const allVTLResolverKeys: string[] = [];
const allVTLResolverRequestFiles: Promise<string>[] = [];
const allVTLResolverResponseFiles: Promise<string>[] = [];
Object.keys(template.Resources).forEach(async (key) => {
	const cfResource = template.Resources[key];
	if ((cfResource.Type === 'AWS::AppSync::Resolver') || (cfResource.Type === 'AWS::AppSync::FunctionConfiguration')) {
		if (cfResource.Properties.Runtime?.Name === 'APPSYNC_JS') {
			allJSResolverKeys.push(key);
			allJSResolverFiles.push(fs.readFile(cfResource.Properties.Code, { encoding: 'utf-8' }));
		} else if (cfResource.Properties.RequestMappingTemplate && cfResource.Properties.ResponseMappingTemplate) {
			allVTLResolverKeys.push(key);
			allVTLResolverRequestFiles.push(fs.readFile(cfResource.Properties.RequestMappingTemplate, { encoding: 'utf-8' }));
			allVTLResolverResponseFiles.push(fs.readFile(cfResource.Properties.ResponseMappingTemplate, { encoding: 'utf-8' }));
		}
	}
});
/**
 * read all JS files and replace the Code with actual code
 */
const files = await Promise.all(allJSResolverFiles);
allJSResolverKeys.forEach((key, index) => {
	template.Resources[key].Properties.Code = files[index];
});

const filesRequest = await Promise.all(allVTLResolverRequestFiles);
const filesRespose = await Promise.all(allVTLResolverResponseFiles);
allVTLResolverKeys.forEach((key, index) => {
	template.Resources[key].Properties.RequestMappingTemplate = filesRequest[index];
	template.Resources[key].Properties.ResponseMappingTemplate = filesRespose[index];
});


/*
      RequestMappingTemplate: './appsync/resolvers/vtl/AppSyncApi/Query.recipeGetById.request.vtl'
      ResponseMappingTemplate: './appsync/resolvers/vtl/AppSyncApi/Query.recipeGetById.response.vtl'
*/


logInfo(`Recreating ${yamlTemplateFile}`);
templateBody = YAML.stringify(template, {
	indent: 2,
	defaultStringType: 'QUOTE_DOUBLE',
});

/**
 * upload new CloudFormation template to S3 installation bucket
 */
const installFileNamesPrefix = `${awsConfig.region}-${stackName}`;

const templateFileName = `${installFileNamesPrefix}-${projectName}-${enviroment}-${(new Date()).valueOf()}.yml`;
logInfo(`Uploading to S3: ${templateFileName}`);
const s3 = new S3Client({
	...awsConfig,
} as S3ClientConfig);
const uploadParams: PutObjectCommandInput = {
	Bucket: bucketName,
	Key: templateFileName,
	Body: templateBody,

};
await s3.send(new PutObjectCommand(uploadParams));


const client = new CloudFormationClient(awsConfig);

/**
 * validate template
 */
logInfo('Validating template');
try {
	const bucketPath = `https://${bucketName}.s3.${awsConfig.region}.amazonaws.com/${templateFileName}`;
	const validate = new ValidateTemplateCommand({
		TemplateURL: bucketPath,
	});
	await client.send(validate);
} catch (error) {
	logError(error);
	process.exit(1);
}

async function describeStack(stName: string) {
	const command = new DescribeStacksCommand({
		StackName: stName,
	});
	return client.send(command);
}

/**
 * check if the stack exists
 */
logInfo(`Checking for stack ${stackName}`);

let createStack = false;
try {
	await describeStack(stackName);
} catch (error) {
	if (error instanceof CloudFormationServiceException && (error as CloudFormationServiceException).name === 'ValidationError') {
		createStack = true;
	} else {
		logError(error);
		process.exit(2);
	}
}

// async function describeStackState(stName: string, startDate: Date) {

// 	let newStart = startDate;
// 	let terminate = false;


// 	const loopFunction = (event: StackEvent) => {
// 		const now = new Date();
// 		event.Timestamp = event.Timestamp ?? now;
// 		if (event.Timestamp > newStart) {
// 			console.log(event);
// 			newStart = event.Timestamp;
// 			console.log(
// 				terminate,
// 				(event.ResourceType === 'AWS::CloudFormation::Stack'),
// 				(event.ResourceStatus !== undefined),
// 				(([StackStatus.UPDATE_COMPLETE, StackStatus.UPDATE_ROLLBACK_COMPLETE] as string[]).includes(event.ResourceStatus ?? '')),
// 			);
// 			terminate = terminate || (
// 				(event.ResourceType === 'AWS::CloudFormation::Stack') &&
// 				(event.ResourceStatus !== undefined) &&
// 				(([StackStatus.UPDATE_COMPLETE, StackStatus.UPDATE_ROLLBACK_COMPLETE] as string[]).includes(event.ResourceStatus))
// 			);
// 			console.log(terminate);
// 		}
// 	};

// 	while (true) {
// 		console.log('START');
// 		const command = new DescribeStackEventsCommand({
// 			StackName: stName,
// 		});
// 		const result = await client.send(command); // eslint-disable-line

// 		// const result = await describeStack(stName);

// 		terminate = false;
// 		if (result.StackEvents)	{
// 			result.StackEvents.reverse().forEach(loopFunction);
// 		}
// 		if (terminate) {
// 			console.log('END');
// 			break;
// 		} else {
// 			await new Promise((r) => { // eslint-disable-line
// 				setInterval(() => {
// 					r(undefined);
// 				}, 5000);
// 			});
// 			console.log('CONTINUE');
// 		}

// 	}

// 	console.log('END');


// }


/**
 * if stack does not exists, create one; update otherwise
 */
if (createStack) {
	logInfo(`Creating stack ${stackName}`);
	try {
		const createCommand = new CreateStackCommand({
			StackName: stackName,
			TemplateBody: templateBody,
			Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
		});
		await client.send(createCommand);
	}	catch (error) {
		logError(error);
		process.exit(3);
	}
} else {
	try {
		logInfo(`Updating stack ${stackName}`);
		const updateCommand = new UpdateStackCommand({
			StackName: stackName,
			TemplateBody: templateBody,
			Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
		});
		// const now = (new Date());
		await client.send(updateCommand);
		// await describeStackState(stackName, now);
		// console.log('AFTER');

		await waitUntilStackUpdateComplete(
			{
				client,
				maxWaitTime: 60 * 60,
				maxDelay: 5,
				minDelay: 5,
			},
			{
				StackName: stackName,
			},
		);
		logInfo(`Stack ${stackName} updated`);

		// console.log(updateResult);
	}	catch (error) {
		logError(error);
	}
}

/**
 * zip directory containing lambda code
 */
function zipLambda(folder: string, lambdaName: string): Promise<void> {
	return new Promise((resolve, reject) => {
		zipFolder(folder, `./${lambdaName}.zip`, (err: Error) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * upload a deploy lambda code, if differs
 */
async function updateLambdaSource(lambdaName: string, lambdaPath: string): Promise<string> {
	let result = '';
	logInfo(`${lambdaName}: Zipping lambda`);
	await zipLambda(lambdaPath, lambdaName);
	const localLambdaPath = `./${lambdaName}.zip`;
	const crc32 = crc.crc32(await fs.readFile(localLambdaPath)).toString(16);
	const newLambdaName = `${installFileNamesPrefix}-${lambdaName}-${crc32}.zip`;
	const testLambdaInput: HeadObjectCommandInput = {
		Bucket: bucketName,
		Key: newLambdaName,
	};

	let upload = false;
	try {
		await s3.send(new HeadObjectCommand(testLambdaInput));
	} catch (err) {
		upload = true;
	}

	if (upload) {
		logInfo(`${lambdaName}: Uploading Lambda code ${newLambdaName}`);
		const lambdaBody = (await fs.readFile(localLambdaPath));
		const uploadLambdaParams: PutObjectCommandInput = {
			Bucket: bucketName,
			Key: newLambdaName,
			Body: lambdaBody,

		};
		await s3.send(new PutObjectCommand(uploadLambdaParams));

		const lambdaClient = new LambdaClient(awsConfig);

		logInfo(`${lambdaName}: Updating Lambda code`);

		const lambdaInput: UpdateFunctionCodeCommandInput = {
			FunctionName: lambdaName,
			S3Bucket: bucketName,
			S3Key: newLambdaName,
		};
		const lambdaCommand = new UpdateFunctionCodeCommand(lambdaInput);
		await lambdaClient.send(lambdaCommand);
		result = newLambdaName;
	} else {
		logInfo(`${lambdaName}: File already exists - no update`);
	}
	await fs.rm(localLambdaPath);
	return result;
}

if (lambdaSources) {
	await Promise.all(Object.entries(lambdaSources).map(([lambdaName, lambdaPath]) => updateLambdaSource(lambdaName, lambdaPath)));
}
