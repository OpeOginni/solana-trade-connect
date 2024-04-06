import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// if (!UPSTASH_REDIS_REST_URL) {
//   console.error("UPSTASH_REDIS_REST_URL is required");
//   process.exit(1);
// }

// If we set encypted to true
// const publisher = new Redis(UPSTASH_REDIS_REST_URL, {
//   tls: {
//     rejectUnauthorized: true,
//   },
// });

// const publisher = new Redis(UPSTASH_REDIS_REST_URL);

export const publisher = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
});

// const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

export const subscriber = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
});
