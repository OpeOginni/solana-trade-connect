import dotenv from "dotenv";

dotenv.config();

import { HealthCheckResponse } from "../types/health-check.types";

const PORT = parseInt(process.env.PORT || "3001");

export async function getHealtyServer(): Promise<HealthCheckResponse> {
  return {
    status: "healthy",
    success: true,
    port: PORT,
  };
}

export async function getUnhealtyServer(): Promise<HealthCheckResponse> {
  return {
    status: "unhealthy",
    success: false,
    port: PORT,
  };
}
