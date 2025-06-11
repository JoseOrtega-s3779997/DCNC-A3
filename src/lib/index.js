/**
 * Code originally from DCNC Week 8 lab example, modified
 **/

const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-providers");
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { join } = require("path");
const path = require("path");
const fs = require("fs/promises");
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

async function loadFullFaq() {
  try {
    const filePath = path.join(process.cwd(), "src", "app", "docs", "FAQ.json");
    const raw = await fs.readFile(filePath, "utf8");
    const faqData = JSON.parse(raw);

    let output = [];
    faqData.forEach(topicEntry => {
      output.push(`Topic: ${topicEntry.topic}`);
      topicEntry.qa.forEach(({ question, answer }, i) => {
      const cleanQ = question?.trim().replace(/\s+/g, ' ') || ''; // Trim Q and A
      const cleanA = answer?.trim().replace(/\s+/g, ' ') || '';
      output.push(`Q${i + 1}: ${cleanQ}`);
      output.push(`A${i + 1}: ${cleanA}`);
      output.push('');
    });
    });

    return output.join('\n');
  } catch (err) {
    console.error("Error loading FAQ.json:", err);
    return "";
  }
}

/**
 * Authenticates the user with AWS Cognito using username and password,
 * then returns temporary AWS credentials.
 *
 * This functions as intended similar to Python example DO NOT TOUCH
 *
 * @param {string} username - Cognito username
 * @param {string} password - Cognito password
 * @returns {Promise<import("@aws-sdk/types").AwsCredentialIdentityProvider>} - Temporary AWS credentials
 * @throws {Error} If authentication or credential fetching fails
 */
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
/**
 * Sends user input and optional document content to AWS Bedrock
 * using the ConverseCommand and returns the generated response.
 *
 * This functions as intended similar to Python example DO NOT TOUCH
 *
 * @param {string} userPrompt - The user's question or input
 * @param {string} [docText=''] - Optional extracted text from a PDF or other document
 * @returns {Promise<{raw: object, message: string}>} - AI response and raw response for debugging
 * @throws {Error} If the Bedrock API call fails
 */
async function invokeBedrock(userPrompt, docText = '') {
  try {
    const bedrockClient = new BedrockRuntimeClient({
      region: REGION,
      credentials: await getCredentials(USERNAME, PASSWORD)
    });

    const faqText = await loadFullFaq();

    const input = {
      modelId: MODEL_ID,
      system: [{
        text: "You are a helpful assistant that supports students in selecting courses from the " +
              "user's desired program or courses such as Bachelor of Information Technology (BP162P23), Cyber Security (BP355) or Computer Science (BP094P21) for example. " + // Add variable to replace degree
              "Recommend only from the official course list. Each course is categorized as core, capstone, minor, or elective. " +
              "Use the recommended structure to suggest suitable courses based on study year and interest. " +
              "If the user asks about enrolling into courses, but has not uploaded any files or any provided RMIT documents for context, ask them to provide more information. " +
              "If the user has any queries about RMIT in general unrelated to courses or enrollment, refer to the FAQ file to answer their questions clearly with offical RMIT website links where necessary." +
              "Do not say you have access to the FAQ file when talking about general questions about RMIT. " +
              // "When you mention websites or references, return clickable links using HTML anchor tags (e.g., <a href='...'>text</a>)." +
              "Finally, if the user's input are simple prompts unrelated to RMIT enrollment such as 'hello' or a question about something, assume the role of a general, all-purpose assistant and keep your answer short and simple"
      }],
      messages: [{
        role: "user",
        content: [{ 
            text:
            `${userPrompt}\n\n` +
            `${docText ? "Document:\n" + docText + "\n\n" : ""}` +
            `${faqText ? "FAQ:\n" + faqText : ""}`
        }]
      }],
        inferenceConfig: { // OPTIONAL: Have a function to allow changing of temperature and topP
            maxTokens: 1024, // <= Output size; the max amount of tokens (words) allowed to be generated
            temperature: 0.2, // <= Creativity; 0.0 for most accurate, factual | 1.0 for more whimsy, randomness
            topP: 0.5 // <= Sampling; 0.0 for safest, most predictable | 1.0 for more diversity, less predictable
        }
        };

        // Output data to be sent
        console.log("Sending this JSON to Bedrock:\n", JSON.stringify(input, null, 2));
        // response assigned bedrock response
        const response = await bedrockClient.send(new ConverseCommand(input));
        // Output response
        console.log("Raw Bedrock response:\n", JSON.stringify(response, null, 2));

        if (!response) {
            console.error("No response!");
            return null;
        }

        return {
            raw: response, // For debugging purposes (check console)
            message: response.output.message.content[0].text
        };
    } catch (error) {
        console.error("Error invoking Bedrock:", error);
        throw error;
    }
}

module.exports = { invokeBedrock };

// Keep old code just in case
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