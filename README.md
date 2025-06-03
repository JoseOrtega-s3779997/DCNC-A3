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
## Models Available
We provides several powerful models for students to access:
* **Anthropic Claude 3 Haiku** ( anthropic.claude-3-haiku-20240307-v1:0 )
* **Anthropic Claude 3.5 Sonnet** ( anthropic.claude-3-5-sonnet-20240620-v1:0 )
* **Anthropic Claude 3.7 Sonnet** ( us.anthropic.claude-3-7-sonnet-20250219-v1:0 )
* **Amazon Nova Pro** ( amazon.nova-pro-v1:0 )
* **Meta Llama 4 Maverick 17B Instruct** ( us.meta.llama4-maverick-17b-instruct-v1:0 )

If you want to use them, please copy model id in brackets and paste them into `.env` or `.env.local`, where the key is `MODEL_ID`.