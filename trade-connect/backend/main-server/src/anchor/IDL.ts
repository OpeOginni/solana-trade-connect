import { Idl } from "@project-serum/anchor";

const IDL: Idl = {
  version: "0.1.0",
  name: "escrow_simple",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "traderAState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "traderBState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
        {
          name: "traderA",
          type: "publicKey",
        },
        {
          name: "traderB",
          type: "publicKey",
        },
        {
          name: "aMintTokens",
          type: {
            vec: "publicKey",
          },
        },
        {
          name: "bMintTokens",
          type: {
            vec: "publicKey",
          },
        },
      ],
    },
    {
      name: "depositIndividual",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "initializer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "traderState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "initializerAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
      ],
    },
    {
      name: "withdrawIndividual",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "initializer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "traderState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "initializerAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
      ],
    },
    {
      name: "cancelIndividual",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "initializer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "traderState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "initializerAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
      ],
    },
    {
      name: "updateTraderDepositStatus",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositorState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "withdrawerState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
        {
          name: "depositor",
          type: "publicKey",
        },
        {
          name: "withdrawer",
          type: "publicKey",
        },
      ],
    },
    {
      name: "updateTraderWithdrawalStatus",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrowAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipientState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "senderState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "escrowId",
          type: "string",
        },
        {
          name: "recipient",
          type: "publicKey",
        },
        {
          name: "sender",
          type: "publicKey",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "UserEscrowState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "escrowId",
            type: "string",
          },
          {
            name: "trader",
            type: "publicKey",
          },
          {
            name: "traderMint",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "state",
            type: {
              defined: "UserStatus",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "Escrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "escrowId",
            type: "string",
          },
          {
            name: "userStateAccount1",
            type: "publicKey",
          },
          {
            name: "userStateAccount2",
            type: "publicKey",
          },
          {
            name: "escrowState",
            type: {
              defined: "Status",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "UserStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initialized",
          },
          {
            name: "Deposited",
          },
          {
            name: "Cancelled",
          },
          {
            name: "Withdrew",
          },
        ],
      },
    },
    {
      name: "Status",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Initialized",
          },
          {
            name: "Depositing",
          },
          {
            name: "Deposited",
          },
          {
            name: "Cancelled",
          },
          {
            name: "Cancelling",
          },
          {
            name: "Withdrawing",
          },
          {
            name: "Finalized",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "PermissionDenied",
      msg: "",
    },
    {
      code: 6001,
      name: "InitializationFailed",
      msg: "Error: Initialization failed",
    },
    {
      code: 6002,
      name: "WithdrawalFailed",
      msg: "Error: Cannot Withdraw, until all tokens are deposited into their respective Vault ATAs",
    },
    {
      code: 6003,
      name: "RemainingAccountsNotSufficient",
      msg: "Error: The number of remaining accounts is insufficient to update.",
    },
    {
      code: 6004,
      name: "OrderIsNotValid",
      msg: "Error: The oreder of remaining accounts is not valid to update.",
    },
    {
      code: 6005,
      name: "TraderNotIncluded",
      msg: "Error: Trader is not included in escrow",
    },
    {
      code: 6006,
      name: "DespositerAlreadDeposited",
      msg: "Error: Depositor already Deposited",
    },
    {
      code: 6007,
      name: "EscrowNotInitialized",
      msg: "Error: Escrow has not been initialized",
    },
    {
      code: 6008,
      name: "MintAccountNotEq",
      msg: "Error: The Mint Account of the Vault Token is not the same as the Mint Pubkey listed in the Escrow Account",
    },
    {
      code: 6009,
      name: "AtaIsEmpty",
      msg: "Error: The ATA is empty",
    },
  ],
  metadata: {
    address: "Cdazu59QUTfZquTMHZZMkdUQzqiHPGdxNb6dNjCB7VGb",
  },
};

export default IDL;
