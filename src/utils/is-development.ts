type ProcessLike = {
  env?: {
    NODE_ENV?: string;
  };
};

type GlobalWithProcess = typeof globalThis & {
  process?: ProcessLike;
};

export function isDevelopment(): boolean {
  return (globalThis as GlobalWithProcess).process?.env?.NODE_ENV !== "production";
}
