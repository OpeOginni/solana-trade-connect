import { publisher } from "../redis";
import { COMPANY_KEY } from "../redis/keys";
import CustomError from "../lib/customError"

export async function authenticateAccessKey(companyId: string, accessKey: string) {

    const companyKey = COMPANY_KEY(companyId);

  const companyAccessKey = await publisher.hget(companyKey, "access_key");

  if(!companyAccessKey) throw new CustomError("Authentication Error", "Invalid Company", 404)

  if(accessKey !== companyAccessKey) return false;
    
  return true;
}
