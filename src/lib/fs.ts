import { Result, ResultAsync } from "neverthrow";
import fs from "fs/promises";
import { AppError } from "./error";
import { createReadStream, createWriteStream } from "fs";

export namespace FileSystem {
  export class FilesystemError extends AppError {
    public readonly tag = "FilesystemError";
  }

  export const safeMkdir = ResultAsync.fromThrowable(
    fs.mkdir,
    (e) => new FilesystemError("error creating directory", e),
  );

  export const safeOpen = ResultAsync.fromThrowable(
    fs.open,
    (e) => new FilesystemError("error opening file", e),
  );

  export const safeWriteFile = ResultAsync.fromThrowable(
    fs.writeFile,
    (e) => new FilesystemError("error writing file", e),
  );

  export const safeReadFile = ResultAsync.fromThrowable(
    fs.readFile,
    (e) => new FilesystemError("error reading file", e),
  );

  export const safeCreateWriteStream = Result.fromThrowable(
    createWriteStream,
    (e) => new FilesystemError("cant create write stream", e),
  );
  export const safeCreateReadStream = Result.fromThrowable(
    createReadStream,
    (e) => new FilesystemError("cant create read stream", e),
  );
}
