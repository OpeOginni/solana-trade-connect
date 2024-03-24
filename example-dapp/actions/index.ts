"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

const MAIN_SERVER_URL = process.env.MAIN_SERVER_URL || "http://localhost:3002";

const COMPANY_ID = process.env.COMPANY_ID;

const COMPANY_ACCESS_KEY = process.env.COMPANY_ACCESS_KEY;

const mainServerApi = axios.create({ baseURL: `http://localhost:3002/api/v1` });
const chatServerApi = axios.create({ baseURL: `http://localhost:3001/api/v1` });

const loginCompanyUserSchema = z.object({
  id: z.string().uuid(),
  accessKey: z.string(),
  userAddress: z.string(),
  tokenExpiration: z.number().min(Date.now()).optional(),
});

export async function getWebsocketJWT(userAddress: string) {
  try {
    const dto = loginCompanyUserSchema.parse({
      id: COMPANY_ID,
      accessKey: COMPANY_ACCESS_KEY,
      userAddress: userAddress,
      tokenExpiration: Date.now() + 1000 * 60 * 60 * 24,
    });

    const response = await mainServerApi.post<{ success: true; token: string }>("/companies/login/user", dto);
    cookies().set("trade-connect-token", response.data.token, { expires: dto.tokenExpiration });

    return response.data;
  } catch (err: any) {
    console.log(err);
  }
}

export async function getUserChat(userAddress: string, recipientAddress: string) {
  try {
    const token = cookies().get("trade-connect-token");
    if (!token) throw new Error("No token");
    const response = await chatServerApi.get<{ success: true; chats: string[] }>(`/chats/${recipientAddress}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (err: any) {
    console.log("ERROR");

    // console.log(err);
  }
}
