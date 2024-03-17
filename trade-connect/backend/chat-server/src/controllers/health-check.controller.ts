import { Request, Response } from "express";

import { getHealtyServer, getUnhealtyServer } from "../services/health-check.service";

export async function getHealthCheck(req: Request, res: Response) {
  try {
    const response = await getHealtyServer();
    return res.status(200).json(response);
  } catch (err) {
    const response = await getUnhealtyServer();
    return res.status(500).json(response);
  }
}
