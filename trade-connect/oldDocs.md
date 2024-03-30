# Server API Documentation

This document describes the REST and Socket APIs for the Client Server.

> [SIGN UP](http://localhost:3000) to Solana Trade Connect to get COMPANY_ID & ACCESS_KEY

## REST API

### `POST /api/v1/auth/login/user`

Returns a TOKEN to authenticate a user Websocket Connection and Calls to Fetch Chats.

**Request Body:**

- `id`: string
- `accessKey`: string
- `userAddress`: string
- `tokenExpiration`: number (optional but recommended)

**Response:**

- `200 OK` on success
- {success: boolean, token: string}

### `GET /api/v1/chats/:receiverAddress`

Returns Chats with another user.

**Request URL Param:**

- `receiverAddress`: string

**Request Authorization:**

- `Bearer <userToken>`

**Response:**

- `200 OK` on success
- {success: boolean, chats: Chats []}

> CHATS Type =
> { fromAddress: string, toAddress: string, message: string, timestamp: number }

## Socket API

### Connection Tips

> Connection To Websocket is Authenticated with a User Token

```ts
    const socket = io(SOCKET_URL, {
        ...,
      auth: {
        token: userWebsocketToken,
      },
    });
```

> User Token can be gotten from `/api/v1/auth/login/user` Endpoint.

### Possible Client Events to Emit

### `new_message`

Listens for a new message event. This event expects a callback function that will be called with the result of the message sending operation.

**Payload:**

- `newMessage`: Object of type `NewMessageDto` with the following properties:
  - `message`: string
  - `fromAddress`: string
  - `toAddress`: string

**Callback Function:**

The callback function will be called with a `message` object if the message sending operation is successful. The `message` object has the following properties:

- `message`: string
- `fromAddress`: string
- `toAddress`: string
- `timestamp`: string;

**Example:**

```ts
socket.emit(
  "new_message",
  { message, fromAddress, toAddress },
  (returnedMessage: { message: string; fromAddress: string; toAddress: string; timestamp: string }) => {
    setMessages((prevMessages) => [...prevMessages, returnedMessage]);
  }
);
```

#### `get_recent_chats`

Sends an event `recent_chats` to the connected socket that carries a list of recent addresses with chats.

**Payload:**

- NO PAYLOAD

#### `create_trade`

Creates a trade object and returns and saves the trade ID as the chat message.

**Payload:**

- `companyId`: string;
- `tradeCreatorAddress`: string;
- `tradeCreatorSwapItems`: string[];
- `tradeRecipientAddress`: string;
- `tradeRecipientSwapItems`: string[];

#### `update_trade_items`

Updates the Items to be swapped in a trade during user negotiation.

**Payload:**

- `tradeId`: string;
- `updaterAddress`: string;
- `tradeCreatorSwapItems`: string[];
- `tradeRecipientSwapItems`: string[];

#### `accept_trade`

Accepts a Trade, Initialized an Escrow Contract and Returns Transactions for both users to SIGN inorder to trade collectables.

**Payload:**

- `tradeId`: string;
- `updaterAddress`: string;

#### `reject_trade`

Rejects a trade (should be called by user who didnt last update the trade).

**Payload:**

- `tradeId`: string;
- `updaterAddress`: string;

#### `cancle_trade`

Cancles a trade (should be called by user who last updated the trade).

**Payload:**

- `tradeId`: string;
- `updaterAddress`: string;

### Client Channels to Listen to

#### `recent_chat_list`

Returns all recent chats with users (other Addresses).

#### `unread_messages`

Returns all chats that were sent when user was offline.

#### `chat:new-message:<companyId>:<userAddress>`

Listens to when a new messages comes in for a particular user.

### Other Possible Clinet Channels to Listen to

#### `company<companyId>:online-count-updated`

Listens to when a new user comes online, or goes offline, it returns the total number of online users for a company.

## Future Features (COMING SOON!)

**Exposure of gRPC Connection**: Companies who want to handle the chat service themselves and only need the trade service will soon be able to access the gRPC endpoints to handle all trade functionalities.
