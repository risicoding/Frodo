import { Api, TelegramClient } from "teleproto";
import { mkdir } from "node:fs/promises";
import { StringSession } from "teleproto/sessions";
import { createSingleBar } from "./lib/progress";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { FileSystem } from "./lib/fs";
import os from "os";
import { createHash } from "node:crypto";
import { err } from "neverthrow";
import { iterDownload } from "teleproto/client/downloads";

const BOT_TOKEN = "8648018283:AAFNcW_Wwh1ZGMKIpAa7uMs2YmeB9Vnf_4M";
const API_ID = 39678174;
const API_HASH = "31622e3051d53da9ee4f0cc8c05d9b39";

const DOWNLOAD_DIR = "./downloads";

const chatId = 8974895234;
const msgId = 35;

export const downloadFile = async (msgId: number, fileName: string) => {
  const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
    connectionRetries: 5,
    timeout: 200000,
  });

  await client.start({
    botAuthToken: BOT_TOKEN,
    onError: console.error,
  });

  const messages = await client.getMessages(chatId, {
    ids: msgId,
  });

  const document = messages[0]?.document;
  if (!document) return;

  const hash = createHash("sha256").update(fileName).digest("hex");
  const downloadDir = path.join("./downloads", hash);

  const res = await FileSystem.safeMkdir(downloadDir, { recursive: true });

  if (res.isErr()) return err(res.error);

  const location = new Api.InputDocumentFileLocation({
    id: document.id,
    accessHash: document.accessHash,
    fileReference: document.fileReference,
    thumbSize: "",
  });

  const bar = createSingleBar();
  bar.start(Number(document.size), 0);
  let progress = 0;

  const stream = createWriteStream(path.join(downloadDir, fileName));

  for await (const chunk of iterDownload(client, location)) {
    stream.write(chunk);
    progress += chunk.length;
    bar.update(progress);
  }

  bar.stop();
};
