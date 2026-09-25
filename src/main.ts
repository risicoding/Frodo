import { Bot } from "grammy";
import { Teleproto } from "./teleproto";
import { formatBytes } from "./lib/format";
import { FileSystem } from "./lib/fs";
import { logger } from "./lib/logger";
import { ok, safeTry } from "neverthrow";
import { constants } from "./constants";
import { botHandler } from "./bot";

const { BOT_TOKEN, DOWNLOAD_DIR } = constants;

const main = () =>
  safeTry(async function* () {
    yield* FileSystem.safeMkdir(DOWNLOAD_DIR, { recursive: true });

    const client = yield* Teleproto.getTelegramClient();

    botHandler(client);

    return ok();
  });

main().then((res) =>
  res.match(
    () => {},
    (e) => {
      logger.error(e.log());
      logger.debug(e);
    },
  ),
);
