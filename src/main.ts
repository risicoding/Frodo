import { Bot } from "grammy";
import { Telegram } from "./telegram";
import { formatBytes } from "./lib/format";
import { FileSystem } from "./lib/fs";
import { logger } from "./lib/logger";
import { ok, safeTry } from "neverthrow";

const BOT_TOKEN = "8648018283:AAFNcW_Wwh1ZGMKIpAa7uMs2YmeB9Vnf_4M";

const DOWNLOAD_DIR = "./downloads";

const main = () =>
  safeTry(async function* () {
    yield* FileSystem.safeMkdir(DOWNLOAD_DIR, { recursive: true });

    const client = yield* Telegram.getTelegramClient();

    const bot = new Bot(BOT_TOKEN);

    bot.command("start", async (ctx) => {
      await ctx.reply("Hello! 👋");
    });

    bot.command("help", async (ctx) => {
      await ctx.reply(
        "Available commands:\n" +
          "/start - Start the bot\n" +
          "/help - Show this help",
      );
    });

    bot.on("message:text", async (ctx) => {
      await ctx.reply(`You said: ${ctx.message.text}`);
    });

    bot.on("message:document", async (ctx) => {
      const d = ctx.message.document;

      const fileName = d.file_name;
      const fileSize = d.file_size;

      if (!fileName || !fileSize) {
        return ctx.reply("File attributes not found");
      }

      console.log(`Downloading: ${fileName} : ${formatBytes(fileSize)}`);

      await Telegram.downloadFile(client, ctx.msgId, fileName);
    });

    bot.catch((err) => {
      console.error("Bot error:", err);
    });

    console.log("Bot started");

    bot.start();

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
