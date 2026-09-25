import { ok, ResultAsync, safeTry } from "neverthrow";
import { BotApiError, getBot } from ".";
import { constants } from "../constants";
import { MessageStrings } from "./messages";

const { CHAT_ID } = constants;

export const getTelegramProgressBar = (fileName: string, fileSize: number) => {
  const bot = getBot();
  let msgId: number;

  let date: Date;
  return {
    start: () =>
      ResultAsync.fromPromise(
        bot.api.sendMessage(
          CHAT_ID,
          MessageStrings.progress(fileName, fileSize, 0),
          { parse_mode: "HTML" },
        ),
        (e) => new BotApiError("cant send progress message", e),
      ).map((res) => {
        date = new Date();
        msgId = res.message_id;
      }),

    update: (progress: number) =>
      safeTry(async function* () {
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 1) return ok();

        date = now;

        return ResultAsync.fromPromise(
          bot.api.editMessageText(
            CHAT_ID,
            msgId,
            MessageStrings.progress(fileName, fileSize, progress),
            { parse_mode: "HTML" },
          ),
          (e) => new BotApiError("cant send progress message", e),
        );
      }),

    done: () =>
      ResultAsync.fromPromise(
        bot.api.editMessageText(
          CHAT_ID,
          msgId,
          MessageStrings.downloaded(fileName, fileSize),
          { parse_mode: "HTML" },
        ),
        (e) => new BotApiError("cant send progress message", e),
      ),
  };
};
