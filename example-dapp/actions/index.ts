"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { z } from "zod";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchAllDigitalAssetByOwner,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import dotenv from "dotenv";
import { publicKey } from "@metaplex-foundation/umi";
import { NewMessageDto } from "@/types/websocket.types";

dotenv.config();

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID;

const COMPANY_ACCESS_KEY = process.env.COMPANY_ACCESS_KEY;

const DEVNET_RPC_URL = process.env.ALCHEMY_DEVNET_RPC_URL as string;

const CHAT_SERVER_URL = process.env.CHAT_SERVER_URL as string;

const chatServerApi = axios.create({ baseURL: `${CHAT_SERVER_URL}/api/v1` });

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

    const response = await chatServerApi.post<{ success: true; token: string }>(
      "/auth/login/user",
      dto
    );
    cookies().set("trade-connect-token", response.data.token, {
      expires: dto.tokenExpiration,
    });

    return response.data;
  } catch (err: any) {
    console.log(err);
  }
}

export async function getUserChat(
  userAddress: string,
  recipientAddress: string
) {
  try {
    const token = cookies().get("trade-connect-token");
    if (!token) throw new Error("No token");
    const response = await chatServerApi.get<{
      success: true;
      chats: NewMessageDto[];
    }>(`/chats/${recipientAddress}`, {
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

export async function getUserNFTs(_publicKey: string) {
  try {
    const umi = createUmi(DEVNET_RPC_URL).use(mplTokenMetadata());

    const assets = await fetchAllDigitalAssetByOwner(
      umi,
      publicKey(_publicKey)
    );

    return assets;
  } catch (err: any) {
    console.log(err);
  }
}

export async function getNFTFromMint(mint: string) {
  try {
    const umi = createUmi(DEVNET_RPC_URL).use(mplTokenMetadata());

    const asset = await fetchDigitalAsset(umi, publicKey(mint));

    return asset;
  } catch (err: any) {
    console.log(err);
  }
}
