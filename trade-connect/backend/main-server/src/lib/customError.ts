import { status } from "@grpc/grpc-js";

export default class CustomError extends Error {
  constructor(public title: string, public message: string, public code: number | status) {
    super(message);
    // This line is necessary to restore the correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
