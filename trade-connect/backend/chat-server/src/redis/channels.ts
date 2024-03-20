export const ONLINE_COUNT_UPDATED_CHANNEL = "company_online_count_updated";
export const NEW_MESSAGE_CHANNEL = "chat:new_message";

export const USER_NEW_MESSAGE_CHANNEL = (companyId: string, userAddress: string) => `chat:new-message:${companyId}:${userAddress}`;
export const COMPANY_ONLINE_COUNT_UPDATED_CHANNEL = (companyId: string) => `company:${companyId}:online-count-updated`;
