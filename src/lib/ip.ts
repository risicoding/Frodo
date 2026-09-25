import { ResultAsync } from "neverthrow";
import { AppError } from "./error";
import os from "node:os";

export class IpError extends AppError {
  public readonly tag = "IpError";
}
export const getIp = (): ResultAsync<string, IpError> =>
  ResultAsync.fromPromise(
    new Promise((resolve, reject) => {
      const interfaces = os.networkInterfaces();

      for (const entries of Object.values(interfaces)) {
        for (const entry of entries ?? []) {
          if (entry.family === "IPv4" && !entry.internal) {
            resolve(entry.address);
          }
        }
      }

      reject();
    }),
    (e) => new IpError("cant find ip", e),
  );
