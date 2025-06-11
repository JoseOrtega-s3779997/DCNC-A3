# Test for bedrock access
## Setup
1. Register your account use your student email [here](https://us-east-1kopki1lpu.auth.us-east-1.amazoncognito.com/login?client_id=3h7m15971bnfah362dldub1u2p&response_type=code&scope=aws.cognito.signin.user.admin+email+openid&redirect_uri=https%3A%2F%2Fd84l1y8p4kdic.cloudfront.net)
2. In `.env.local`, set your credentials, where `USERNAME` is your email, and `PASSWORD` is the password used to register.
3. Insall packages
    ```sh
    pnpm install
    ```
4. Run application, you can see output from the model
    ```sh
    pnpm start
    # expected random output from model
    ```
5. Everything should be listed in package.json or package-lock.json, if not yet:
    ```sh
    npm install next@latest react@latest react-dom@latest
    npm install pdf-parse
    npm install formidable
    npm install react-markdown
    ```
6. To start runtime:
    ```sh
    npm run dev: Starts the development server.
    npm run build: Builds the application for production.
    npm run start: Starts the production server.
    next lint: Runs ESLint.
    ```
## Dependencies
This project invovles the use of React and Next.js framework. The code will run based on the Week 8 Lab provided, modified to be
similar to the Lab 9 example via Javascript, JSX and React.
* `aws-sdk`: Service to connect to Amazon Bedrock Service
* `eslint`: Built-in error checking
* `pdf-parse`: PDF reader to parse and extract data from uploaded PDFs
* `danfojs`: Data organisation (optional panda alternative)
* `formidable`: Works in tandem with `pdf-parse` Allows handling of file uploads in forms
* `fs` : Built-in module for reading system files
* `react-markdown` Automatically formats markdown
* `remark` & `rehype` : Allows rendering of html links
* `tailwindcss` : CSS rendering on Next

```
Project folder layout
┬ DCNC-A3
├ .next/            // Next.js & React modules
├ node_modules/     // Node.js modules
├ public/
│   └ vanilla.html  // Temporary html
├ src/
│   ├ app/
│   │   ├ about/
│   │   │   └ page.js   // About page
│   │   ├ api/
│   │   │   └ chabot/
│   │   │       └ route.js  // API routing, POST is processed here
│   │   ├ docs/
│   │   │   ├ FAQ.json      // Raw FAQ data from RMIT
│   │   │   └ FAQ.txt
│   │   ├ layout.js         // Root layout
│   │   └ page.js           // Base UI
│   ├ components/
│   │   ├ Footer.js     // Footer component
│   │   └ Header.js     // Header component
│   ├ lib/
│   │   └ index.js      // Actual AWS bedrock code
│   └ styles/  
│       └ globals.css    // Page styling
├ test/
│   └ data/
│       └ 05-versions-space.pdf     // Temporary pdf-parse test file
├ .env              // Key variables
├ .env.local        // Local variables
├ .eslintrc.json    // ESlint dependency
├ .gitignore
├ package-lock.json // Dependency versions
├ package.json
├ README.md         // You're in it right now
└ start-app.bat     // Temporary CLI startup
```

## Models Available
We provides several powerful models for students to access:
* **Anthropic Claude 3 Haiku** ( anthropic.claude-3-haiku-20240307-v1:0 )
* **Anthropic Claude 3.5 Sonnet** ( anthropic.claude-3-5-sonnet-20240620-v1:0 )
* **Anthropic Claude 3.7 Sonnet** ( us.anthropic.claude-3-7-sonnet-20250219-v1:0 )
* **Amazon Nova Pro** ( amazon.nova-pro-v1:0 )
* **Meta Llama 4 Maverick 17B Instruct** ( us.meta.llama4-maverick-17b-instruct-v1:0 )

If you want to use them, please copy model id in brackets and paste them into `.env` or `.env.local`, where the key is `MODEL_ID`.