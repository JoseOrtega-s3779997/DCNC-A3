/**
 * Code originally from DCNC Week 8 lab example, modified
 * 
 * @throws Credential error: Throws an error when user inputs incorrect or missing credentials
 * @throws API error: Throws an error if API fails to communicate with AWS Bedrock
 * @param userInput User input extracted from API route from browser
 * @param username Authenticated user in .env local file
 * @param password User's password in .env local file
 * @function getCredentials Recieves user input and password and authenticates user key and token
 * @function invokeBedrock Communicate with AWS bedrock with given user prompts and documents
 */

const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-providers");
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { join } = require("path");
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({
    path: join(__dirname, "../../.env.local"),
    override: true
})
// Output credentials on console for testing DELETE LATER
console.log("Loaded ENV values:");
console.log("USERNAME:", process.env.COGNITO_USERNAME);
console.log("PASSWORD:", process.env.COGNITO_PASSWORD);
console.log("APP_CLIENT_ID:", process.env.APP_CLIENT_ID);

const REGION = process.env.REGION;
const MODEL_ID = process.env.MODEL_ID;
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
const USER_POOL_ID = process.env.USER_POOL_ID;
const APP_CLIENT_ID = process.env.APP_CLIENT_ID;
const USERNAME = process.env.COGNITO_USERNAME;
const PASSWORD = process.env.COGNITO_PASSWORD;

// This functions as intended similar to Python example DO NOT TOUCH
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
// This functions as intended similar to Python example DO NOT TOUCH

async function invokeBedrock(userPrompt, docText = '') {
  try {
    const bedrockClient = new BedrockRuntimeClient({
      region: REGION,
      credentials: await getCredentials(USERNAME, PASSWORD)
    });

    const input = {
      modelId: MODEL_ID,
      system: [{
        text: "You are a helpful assistant that supports students in selecting courses from the " +
              "Bachelor of Cyber Security program at RMIT (codes BP355/BP356). " + // Add variable to replace degree
              "Recommend only from the official course list. Each course is categorized as core, capstone, minor, or elective. " +
              "Use the recommended structure to suggest suitable courses based on study year and interest."
      }],
      messages: [{
        role: "user",
        content: [{ text: `${userPrompt}\n\n${docText ? "Document:\n" + docText : ''}` }]
      }],
        inferenceConfig: { // OPTIONAL: Have a function to allow changing of temperature and topP
            maxTokens: 1024, // <= Output size; the max amount of tokens (words) allowed to be generated
            temperature: 0.2, // <= Creativity; 0.0 for most accurate, factual | 1.0 for more whimsy, randomness
            topP: 0.5 // <= Sampling; 0.0 for safest, most predictable | 1.0 for more diversity, less predictable
        }
        };

        console.log("Sending this JSON to Bedrock:\n", JSON.stringify(input, null, 2));

        const response = await bedrockClient.send(new ConverseCommand(input));

        console.log("Raw Bedrock response:\n", JSON.stringify(response, null, 2));

        if (!response) {
            console.error("No response!");
            return null;
        }

        return response.output.message.content[0].text;
    } catch (error) {
        console.error("Error invoking Bedrock:", error);
        throw error;
    }
}

module.exports = { invokeBedrock };
// async function invokeBedrock() {
//     try {
//         const bedrockClient = new BedrockRuntimeClient({
//             region:REGION,
//             credentials: await getCredentials(process.env.USERNAME, process.env.PASSWORD)
//         });

//         const input = {
//             modelId: MODEL_ID,
//             system: [ {text: "You are a helpful assistant helps solving users' problem."} ], // This can be changed through user input
//             messages: [
//                 { role: 'user', content: [ { text: "Hello, how are you?" } ] } // This needs to be replaced by a user variable from web form
//             ],
//             infereceConfig: {
//                 maxTokens: 64,
//                 temperature: 0.2,
//                 topP: 0.9
//             }
//         }

//         const response = await bedrockClient.send(new ConverseCommand(input));
//         if (!response) {
//             console.error("No response!")
//         } else {
//             // This block will be returned and exported
//             console.log("=".repeat(30))
//             console.log("")
//             console.log(response.output.message.content[0].text);
//             console.log("")
//             console.log("=".repeat(30))
//             return // Insert response here;
//         }
//     } catch(error) {
//         console.error(error)
//     }
// }

// invokeBedrock(); // This calls the invoke functions to run the AWS server

// TODO
// 1. Through the webpage, the user will enter a prompt. It may be mandatory to upload official course documentation. DONE
// 2. Through API Routing, the webpage needs to send a req to the index.js to run the chatbot. DONE
// 3. The index.js needs to process user prompt, assign it a string variable. DONE
// 4. Then it needs to read JSON or PDF files and assign them a varaible.
// 5. Then a build prompt function will put these together into one variable to return.
// 6. Then it calls the bedrock runtime function to send the data over to the AWS server.
// 7. The function then returns the answer back to the API.
// 8. The index.js needs to return or export the "answer" variable back to API to be able to display on the webpage
// - (OPTIONAL)
// - Have a function that allows users to change MODELS
// - Have a function that allows users to adjust the bot's temperature and probability to their liking
// - Build a website proper for better user experience.