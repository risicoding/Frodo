import { formatBytes } from "../lib/format";
import { type SystemStats } from "../lib/system";

export namespace MessageStrings {
  export const start = `👋 <b>Hey! I’m Frodo.</b>

📁 Your handy file utility bot for Telegram.

I can help you:
📥 Download files
🗜️ Compress files
📦 Make large files easier to manage

Just send me a file or use one of the commands below.

<b>Commands</b>
/start — About Frodo & how to get started
/help — Show available commands

✨ Simple. Fast. File-friendly.`;

  export const help = `🛠️ <b>Frodo Commands</b>

Here’s what I can do:

/start — Learn about Frodo and get started
/help — Show this help message

📥 <b>File Downloader</b>
Send me a download link and I’ll fetch the file for you.

🗜️ <b>File Compressor</b>
Send me a file and I’ll compress it for you.

That’s it! Simple and straightforward. ✨`;

  export const progress = (
    fileName: string,
    fileSize: number,
    progress: number,
  ) => {
    const barSize = 10;

    const percentage = Math.min(100, Math.max(0, (progress / fileSize) * 100));

    const filled = Math.round((percentage / 100) * barSize);
    const empty = barSize - filled;

    const bar = "▰".repeat(filled) + "▱".repeat(empty);

    return `
📁 <b>${fileName}</b>
📦 ${formatBytes(progress)} / ${formatBytes(fileSize)}

[${bar}] <b>${percentage.toFixed(1)}%</b>
`.trim();
  };

  export const downloaded = (fileName: string, fileSize: number) => `
<b>Downloaded:</b>
📁 <b>${fileName}</b>
📦 ${formatBytes(fileSize)}
`;

  export const system = (info: SystemStats): string => {
    const bar = (percentage: number, length = 10): string => {
      const filled = Math.round((percentage / 100) * length);

      return "█".repeat(filled) + "░".repeat(length - filled);
    };

    const status = (percentage: number): string => {
      if (percentage >= 85) return "🔴";
      if (percentage >= 70) return "🟡";
      return "🟢";
    };

    const formatUptime = (seconds: number): string => {
      const days = Math.floor(seconds / 86_400);
      const hours = Math.floor((seconds % 86_400) / 3_600);
      const minutes = Math.floor((seconds % 3_600) / 60);
      const secs = Math.floor(seconds % 60);

      const parts: string[] = [];

      if (days) parts.push(`${days}d`);
      if (hours) parts.push(`${hours}h`);
      if (minutes) parts.push(`${minutes}m`);
      if (secs || parts.length === 0) parts.push(`${secs}s`);

      return parts.join(" ");
    };

    const formatGB = (bytes: number): string =>
      `${(bytes / 1024 ** 3).toFixed(2)} GB`;

    return [
      "🖥️ <b>Frodo System Status</b>",
      "━━━━━━━━━━━━━━━━━━",
      "",
      "⚡ <b>CPU</b>",
      `${status(info.cpu.usage)} <code>${bar(info.cpu.usage)}</code> ${info.cpu.usage.toFixed(2)}%`,
      `🧵 ${info.cpu.cores} cores`,
      "",
      "🧠 <b>Memory</b>",
      `${status(info.ram.usage)} <code>${bar(info.ram.usage)}</code> ${info.ram.usage.toFixed(2)}%`,
      `${formatGB(info.ram.used)} / ${formatGB(info.ram.total)}  •  ${formatGB(info.ram.free)} free`,
      "",
      "💾 <b>Storage</b>",
      `${status(info.disk.usage)} <code>${bar(info.disk.usage)}</code> ${info.disk.usage.toFixed(2)}%`,
      `${formatGB(info.disk.used)} / ${formatGB(info.disk.total)}  •  ${formatGB(info.disk.free)} free`,
      "",
      `⏱️ <b>Uptime:</b> ${formatUptime(info.uptime)}`,
      `🖥️ <b>Host:</b> ${info.hostname}`,
      `🐧 <b>Platform:</b> ${info.platform}`,
    ].join("\n");
  };
}
