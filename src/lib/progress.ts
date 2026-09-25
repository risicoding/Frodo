import progress from "cli-progress";
import { formatBytes } from "./format";

export const createMutibar = (type: "download" | "upload") => {
  const multibar = new progress.MultiBar(
    {
      format: `${type} |{bar}| {percentage}% | {value}/{total} | {eta}s`,
      formatValue: (value, _, type) => {
        if (type === "value" || type === "total") {
          return formatBytes(value);
        }
        return value.toString();
      },
    },
    progress.Presets.rect,
  );

  return multibar;
};

export const createSingleBar = () => {
  return new progress.SingleBar(
    {
      format: `| {bar} | {percentage}% | {value}/{total} | {eta}s`,
      formatValue: (value, _, type) => {
        if (type === "value" || type === "total") {
          return formatBytes(value);
        }
        return value.toString();
      },
    },
    progress.Presets.rect,
  );
};
