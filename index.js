const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-providers");
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");

const { join } = require("path");
const dotenv = require("dotenv");
dotenv.config();
dotenv.config({
    path: join(__dirname, ".env.local"),
    override: true
})

const REGION = process.env.REGION;
const MODEL_ID = process.env.MODEL_ID;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const USER_POOL_ID = process.env.USER_POOL_ID;
const APP_CLIENT_ID = process.env.APP_CLIENT_ID;

async function getCredentials(username, password) {
    try {
        // Step 1: Authenticate with Cognito User Pool to get ID token
        const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH', 
            ClientId: APP_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });
        const authResponse = await cognitoClient.send(command);
        const idToken = authResponse.AuthenticationResult.IdToken;

        // Step 2: Get temporary AWS credentials using the ID token
        const credentials = fromCognitoIdentityPool({
            identityPoolId: IDENTITY_POOL_ID,
            clientConfig: { region: REGION }, // Fix: Add region to client config
            logins: {
                [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken,
            },
        });

        return credentials;
    } catch (error) {
        console.error('Error obtaining credentials:', error);
        throw error;
    }
}

async function invokeBedrock() {
    try {
        const bedrockClient = new BedrockRuntimeClient({
            region:REGION,
            credentials: await getCredentials(process.env.USERNAME, process.env.PASSWORD)
        });

        const input = {
            modelId: MODEL_ID,
            system: [ {text: "You are a helpful assistant helps solving users' problem."} ],
            messages: [
                { role: 'user', content: [ { text: "Hello, how are you?" } ] }
            ],
            infereceConfig: {
                maxTokens: 64,
                temperature: 0.2,
                topP: 0.9
            }
        }

        const response = await bedrockClient.send(new ConverseCommand(input));
        if (!response) {
            console.error("No response!")
        } else {
            console.log("=".repeat(30))
            console.log("")
            console.log(response.output.message.content[0].text);
            console.log("")
            console.log("=".repeat(30))
        }
    } catch(error) {
        console.error(error)
    }
}

invokeBedrock();