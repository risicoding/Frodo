import { Api, TelegramClient } from "teleproto";
import { StringSession } from "teleproto/sessions";
import { createSingleBar } from "./lib/progress";
import path from "node:path";
import { FileSystem } from "./lib/fs";
import { err, ok, Result, ResultAsync, safeTry } from "neverthrow";
import { iterDownload } from "teleproto/client/downloads";
import { AppError } from "./lib/error";
import { constants } from "./constants";
import { getTelegramProgressBar } from "./bot/progress";
import { FilePartSizeChangedError } from "teleproto/errors";
import { telegramBaseClient } from "teleproto/client";

const { BOT_TOKEN, API_ID, API_HASH, CHAT_ID, DOWNLOAD_DIR } = constants;

export namespace Teleproto {
  class TelegramError extends AppError {
    readonly tag = "TelegramError";
  }

  export const getTelegramClient = () =>
    safeTry(async function* () {
      const client = yield* Result.fromThrowable(
        () =>
          new TelegramClient(new StringSession(""), API_ID, API_HASH, {
            connectionRetries: 5,
            timeout: 200000,
          }),
        (e) => new TelegramError("cant create telegram client", e),
      )();

      yield* ResultAsync.fromPromise(
        client.start({
          botAuthToken: BOT_TOKEN,
          onError: console.error,
        }),
        (e) => new TelegramError("cant start telegram client", e),
      );

      return ok(client);
    });

  export const downloadFile = (
    client: TelegramClient,
    msgId: number,
    fileName: string,
  ) =>
    safeTry(async function* () {
      const messages = yield* ResultAsync.fromPromise(
        client.getMessages(CHAT_ID, {
          ids: msgId,
        }),
        (e) => new TelegramError("cant get message", e),
      );

      const document = messages[0]?.document;
      if (!document) return err(new TelegramError("document not found"));

      const location = new Api.InputDocumentFileLocation({
        id: document.id,
        accessHash: document.accessHash,
        fileReference: document.fileReference,
        thumbSize: "",
      });

      let progress = 0;

      const progressBar = createSingleBar();
      progressBar.start(Number(document.size), 0);

      const telegramBar = getTelegramProgressBar(
        fileName,
        Number(document.size),
      );

      yield* telegramBar.start();

      const stream = yield* FileSystem.safeCreateWriteStream(
        path.join(DOWNLOAD_DIR, fileName),
      );

      for await (const chunk of iterDownload(client, location)) {
        stream.write(chunk);
        progress += chunk.length;
        progressBar.update(progress);
        telegramBar.update(progress);
      }

      progressBar.stop();
      return telegramBar.done();
    });
}
