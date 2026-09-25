const logbase = (i: number, base: number) => Math.log(i) / Math.log(base);

const storageUnits = [
  { unit: "B", name: "Bytes" },
  { unit: "KiB", name: "Kibibytes" },
  { unit: "MiB", name: "Mebibytes" },
  { unit: "GiB", name: "Gibibytes" },
  { unit: "TiB", name: "Tebibytes" },
  { unit: "PiB", name: "Pebibytes" },
  { unit: "EiB", name: "Exbibytes" },
  { unit: "ZiB", name: "Zebibytes" },
  { unit: "YiB", name: "Yobibytes" },
] as const;

export const formatBytes = (bytes: number) => {
  if (bytes <= 0) return { value: 0, unit: storageUnits[0].unit };
  const pow = Math.max(0, Math.floor(logbase(bytes, 1024)));
  const unitIndex = Math.min(pow, storageUnits.length - 1);

  return {
    value: (bytes / 1024 ** unitIndex).toFixed(2),
    unit: storageUnits[unitIndex]!.unit,
  };
};
