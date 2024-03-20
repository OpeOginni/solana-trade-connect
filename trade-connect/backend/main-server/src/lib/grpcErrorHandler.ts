import { sendUnaryData, status } from "@grpc/grpc-js";
import { ZodError } from "zod";
import CustomError from "./customError";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default function grpcErrorHandler(res: sendUnaryData<any>, err: Error) {
  if (err instanceof ZodError) {
    const errors = err.errors.map((error) => ({
      param: error.path[0],
      message: error.message,
    }));

    return res({ name: "ValidationError", message: errors.join(", "), code: status.INVALID_ARGUMENT }, null);
  }

  if (err instanceof PrismaClientKnownRequestError && err.code == "P2025") {
    return res({ name: "ItemNotFound", message: err.message, code: status.NOT_FOUND }, null);
  }

  if (err instanceof CustomError) {
    return res({ name: err.title, message: err.message, code: err.code }, null);
  }

  return res({ name: "InternalError", message: "Internal server error", code: status.INTERNAL }, null);
}
