export const CHAT_KEY = (companyId: string, walletAddress1: string, walletAddress2: string) => {
  // Sort the wallet addresses
  const [firstAddress, secondAddress] = [walletAddress1, walletAddress2].sort();
  // gives a definite key for the chat
  return `chat:${companyId}:${firstAddress}:${secondAddress}`;
};

export const USER_KEY = (companyId: string, userAddress: string) => `company:${companyId}:user:${userAddress}`;
export const COMPANY_KEY = (companyId: string) => `company_info:${companyId}`;
export const COMPANY_ONLINE_COUNT_KEY = (companyId: string) => `chat:company:${companyId}:connection_count`;

export const USER_RECENT_CHAT_LIST = (companyId: string, userAddress: string) => `recent_chats:${companyId}:user:${userAddress}`;
export const UNREAD_CHAT_LIST = (companyId: string, userAddress: string) => `unread_messages:${companyId}:user:${userAddress}`;
