"use server";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_MAIN_SERVER_BASE_URL;

const api = axios.create({
  baseURL: baseUrl,
});
export const authenticatedRequest = async (accessToken: string) => {
  try {
    const response = await api.get("/api/v1/companies", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {}
};
