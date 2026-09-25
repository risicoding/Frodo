import { Bot } from "grammy";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { downloadFile } from "./telegram";
import { formatBytes } from "./lib/format";

const BOT_TOKEN = "8648018283:AAFNcW_Wwh1ZGMKIpAa7uMs2YmeB9Vnf_4M";

const DOWNLOAD_DIR = "./downloads";

async function main() {
  await mkdir(DOWNLOAD_DIR, { recursive: true });

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

    const fileId = d.file_id;
    const fileName = d.file_name;
    const fileSize = d.file_size;

    if (!fileName || !fileSize) {
      return ctx.reply("File attributes not found");
    }
    console.log({
      fileId,
      fileName,
      fileSize,
      sizeMB: formatBytes(fileSize),
    });

    console.log(`Downloading: ${fileName}`);
    console.log(`Telegram size: ${fileSize} bytes`);
    await downloadFile(ctx.msgId, fileName);
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  console.log("Bot started");

  bot.start();
}

main();
