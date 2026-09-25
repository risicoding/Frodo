import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { err, ok, Result, ResultAsync, safeTry } from "neverthrow";
import { AppError } from "./error";
import { MessageStrings } from "../bot/messages";
import type { logger } from "./logger";

const execFileAsync = promisify(execFile);

export class SystemInfoError extends AppError {
  readonly tag = "SystemInfoError";
}

export type SystemStats = {
  cpu: {
    usage: number;
    free: number;
    cores: number;
  };
  ram: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  uptime: number;
  hostname: string;
  platform: NodeJS.Platform;
};

export const getSystemStats = () =>
  safeTry(async function* () {
    const cpus = yield* Result.fromThrowable(
      () => os.cpus(),
      (e) => new SystemInfoError("cant get cpu information", e),
    )();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      idle += cpu.times.idle;

      total +=
        cpu.times.user +
        cpu.times.nice +
        cpu.times.sys +
        cpu.times.irq +
        cpu.times.idle;
    }

    const cpuFreePercent = (idle / total) * 100;
    const cpuUsagePercent = 100 - cpuFreePercent;

    const totalRam = os.totalmem();
    const freeRam = os.freemem();
    const usedRam = totalRam - freeRam;

    let diskTotal: number;
    let diskFree: number;

    if (process.platform === "win32") {
      const { stdout } = yield* ResultAsync.fromPromise(
        execFileAsync("wmic", [
          "logicaldisk",
          "get",
          "size,freespace",
          "/value",
        ]),
        (e) => new SystemInfoError("cant get disk usage info", e),
      );

      const free = stdout.match(/FreeSpace=(\d+)/)?.[1];
      const total = stdout.match(/Size=(\d+)/)?.[1];

      diskFree = Number(free ?? 0);
      diskTotal = Number(total ?? 0);
    } else {
      const { stdout } = yield* ResultAsync.fromPromise(
        execFileAsync("df", ["-k", "/"]),
        (e) => new SystemInfoError("cant get disk usage info", e),
      );

      const [, line] = stdout.trim().split("\n");
      if (!line) return err(new SystemInfoError("cant get disk usage info"));

      const parts = line.trim().split(/\s+/);

      diskTotal = Number(parts[1]) * 1024;
      diskFree = Number(parts[3]) * 1024;
    }

    const diskUsed = diskTotal - diskFree;

    return ok({
      cpu: {
        usage: Math.round(cpuUsagePercent * 100) / 100,
        free: Math.round(cpuFreePercent * 100) / 100,
        cores: cpus.length,
      },

      ram: {
        total: totalRam,
        used: usedRam,
        free: freeRam,
        usage: Math.round((usedRam / totalRam) * 10000) / 100,
      },

      disk: {
        total: diskTotal,
        used: diskUsed,
        free: diskFree,
        usage: Math.round((diskUsed / diskTotal) * 10000) / 100,
      },

      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: process.platform,
    } as SystemStats);
  });

export const getSystemStatsPretty = () =>
  getSystemStats().map((res) => {
    return MessageStrings.system(res);
  });
