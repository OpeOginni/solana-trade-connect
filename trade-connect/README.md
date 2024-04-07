## Server API Documentation

This document describes the REST and WebSocket APIs for the Solana Trade Connect Client Server.

**Signup:**

- Visit [Trade Connect](https://solana-trade-connect.vercel.app/) to get your COMPANY_ID and ACCESS_KEY.

## REST API

### Authentication

**`POST /api/v1/auth/login/user`**

This endpoint authenticates a user and returns a token for subsequent Websocket connections and fetching chats.

**Request Body:**

| Field                      | Type   | Description                                            |
| -------------------------- | ------ | ------------------------------------------------------ |
| id                         | string | User ID                                                |
| accessKey                  | string | User's access key                                      |
| userAddress                | string | User's Solana wallet address                           |
| tokenExpiration (optional) | number | Recommended expiration time for the token (in seconds) |

**Response:**

- On success:
  ```json
  {
    "success": true,
    "token": "your_auth_token"
  }
  ```
- On failure: An error message will be returned.

### Get Chats

**`GET /api/v1/chats/:receiverAddress`**

This endpoint retrieves past chat history with another user.

**Request URL Parameter:**

- `receiverAddress`: string - The Solana wallet address of the recipient user.

**Authorization:**

- Include a `Bearer` token in the authorization header:
  ```
  Authorization: Bearer <userToken>
  ```

**Response:**

- On success:
  ```json
  {
    "success": true,
    "chats": [
      {
        "fromAddress": "user1_address",
        "toAddress": "user2_address",
        "message": "Hello!",
        "timestamp": 1675283200 // Unix timestamp in seconds
      }
      // ... other chat messages
    ]
  }
  ```
- On failure: An error message will be returned.

**Note:**

- `CHATS` type:
  ```
  {
    "fromAddress": string,
    "toAddress": string,
    "message": string,
    "timestamp": number
  }
  ```

## WebSocket API

**Connection:**

- Websocket connections require a valid user token obtained from the `/api/v1/auth/login/user` endpoint. Here's an example using `socket.io`:

```typescript
const socket = io(SOCKET_URL, {
  // ... other options
  auth: {
    token: userWebsocketToken,
  },
});
```

**Client Events**

### `new_message`

This event allows sending new messages to another user.

**Payload:**

- `newMessage`: Object of type `NewMessageDto` with the following properties:
  - `message`: string - The message content
  - `fromAddress`: string - Sender's Solana wallet address
  - `toAddress`: string - Recipient's Solana wallet address

**Callback Function:**

The provided callback function will be executed with a `message` object upon successful message delivery. The `message` object includes:

- `message`: string - The sent message content
- `fromAddress`: string - Sender's Solana wallet address
- `toAddress`: string - Recipient's Solana wallet address
- `timestamp`: string - Message timestamp (in ISO 8601 format)

[Complete Message Type](https://github.com/OpeOginni/solana-trade-connect/blob/main/trade-connect/backend/chat-server/src/types/chat.types.ts#L3)

**Example:**

```typescript
socket.emit(
  "new_message",
  { message, fromAddress, toAddress },
  (returnedMessage: { message: string; fromAddress: string; toAddress: string; timestamp: string }) => {
    setMessages((prevMessages) => [...prevMessages, returnedMessage]);
  }
);
```

### `get_recent_chats`

This event requests a list of recent chat addresses from the server.

**Payload:**

- No payload required.

## Trade Management Events:

These events manage trade creation, negotiation, and completion.

**`create_trade`**

Creates a trade object and returns the trade ID as the chat message.

**Payload:**

- `companyId`: string - ID of the company facilitating the trade.
- `tradeCreatorAddress`: string - Solana wallet address of the user initiating the trade.
- `tradeCreatorSwapItems`: string[] - List of Solana wallet addresses or NFTs the initiator offers to swap (can be wallet addresses of tokens or NFTs).
- `tradeRecipientAddress`: string - Solana wallet address of the recipient user.
- `tradeRecipientSwapItems`: string[] - List of Solana wallet addresses or NFTs the recipient offers to swap (can be wallet addresses of tokens or NFTs).

**Callback Function:**

The provided callback function will be executed with a `message` object upon successful message delivery. The `message` object includes:

- `message`: string - The sent message content
- `fromAddress`: string - Sender's Solana wallet address
- `toAddress`: string - Recipient's Solana wallet address
- `timestamp`: string - Message timestamp (in ISO 8601 format)

[Complete Message Type](https://github.com/OpeOginni/solana-trade-connect/blob/main/trade-connect/backend/chat-server/src/types/chat.types.ts#L3)

**Example Payload:**

```json
{
  "companyId": "company_123",
  "tradeCreatorAddress": "user1_wallet_address",
  "tradeCreatorSwapItems": ["asset_mint_address_1", "asset_mint_address_2"],
  "tradeRecipientAddress": "user2_wallet_address",
  "tradeRecipientSwapItems": ["asset_mint_address_3"]
}
```

**`update_trade_items`**

Updates the items to be swapped during trade negotiation. This allows users to modify their offers before finalizing the trade.

**Payload:**

- `tradeId`: string - The unique identifier of the trade being negotiated.
- `updaterAddress`: string - Solana wallet address of the user updating the trade items.
- `tradeCreatorSwapItems`: string[] (optional) - Updated list of items offered by the trade initiator.
- `tradeRecipientSwapItems`: string[] (optional) - Updated list of items offered by the trade recipient.

**Note:** The `tradeCreatorSwapItems` or `tradeRecipientSwapItems` should be included as all the new items to be traded.

**`accept_trade`**

Accepts a trade, initializes an escrow contract to hold the swapped items securely, and returns transactions for both users to sign in order to complete the trade.

**Payload:**

- `tradeId`: string - The unique identifier of the trade being accepted.
- `updaterAddress`: string - Solana wallet address of the user accepting the trade.

**`reject_trade`**

Rejects a trade proposal from the other user.

**Payload:**

- `tradeId`: string - The unique identifier of the trade being rejected.
- `updaterAddress`: string - Solana wallet address of the user rejecting the trade.

**`cancel_trade`**

Cancels a trade that is still under negotiation. This can only be done by the user who initiated the trade (tradeCreatorAddress).

**Payload:**

- `tradeId`: string - The unique identifier of the trade being canceled.
- `updaterAddress`: string - Solana wallet address of the user canceling the trade (must be the trade creator).

## Coming Soon Features

**gRPC Connection Exposure**

Companies who manage their own chat service and only require the trade functionality will soon be able to connect via gRPC endpoints to handle all trade operations programmatically. Stay tuned for updates!
