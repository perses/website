export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ['KiB', 'MiB', 'GiB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

const osLabels: Record<string, string> = {
  linux: 'Linux',
  darwin: 'macOS',
  windows: 'Windows',
  freebsd: 'FreeBSD',
  netbsd: 'NetBSD',
  openbsd: 'OpenBSD',
};

export function osLabel(os: string): string {
  return osLabels[os] ?? os;
}
