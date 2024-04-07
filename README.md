# Solana Trade Connect - Solana's Asset-Market As A Service

## Introduction

Solana Trade Connect is a comprehensive development tool designed to empower creators of decentralized applications (DApps) and games on the Solana Blockchain. It provides a suite of robust APIs that allow seamless integration of trade, swap, and chat features into your applications.

By leveraging Solana Trade Connect, developers can focus on their core application logic, while leaving the complexities of trade and chat functionalities to our reliable and secure platform.

## Features

- **Trade and Swap Integration:** Easily integrate trade and swap functionalities into your DApps and games.
- **Chat Feature:** Enhance user engagement by integrating the chat feature.
- **Developer-Friendly APIs:** Our APIs are designed to be easy to use, enabling quick integration.

## Getting Started

To get started with Solana Trade Connect, you need to sign up your company on the Trade-Connect Site. Once signed up, you will have access to our APIs and documentation that guide you through the integration process.

1. Sign up your company on the [Trade-Connect](https://solana-trade-connect.vercel.app/) Site.
2. Obtain your CompanyID and AccessKey and check out the integration documentation.
3. Integrate trade, swap, and chat features into your DApps and games.

## Dev Flow Architecutre

![Developer Flow](/media/Trade-Connect_Client-Interaction-Diagram.png)

## Future Developments

We are continuously working to enhance Solana Trade Connect. In the future, we plan to introduce new paid features that allow Group Trades and chats, also direct connection with the gRPC trade creation service for companies who want to host the chat service themselves.
Also with more time and resources put into the project we can better strcuture the underlying Rust Contract that Handles the market swap.

Stay tuned for these exciting updates!

## Test For yourself

- Clone the [trade-connect-example-dapp](https://github.com/OpeOginni/trade-connect-example-dapp) repo
- Sign Up and Get your Company Details from [**Trade Connect**](https://github.com/OpeOginni/solana-trade-connect/blob/main/trade-connect/backend/chat-server/src/app.ts)
- Update the values into the `.env.local` file.
- Run `npm install` or `bun install` to install all needed dependencies.
- Then run `npm run dev` or `bun run dev` to run the example-dapp using the Trade Connect APIs
