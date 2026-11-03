/**
 * Deployment environment names (ADR-002 §4). The browser learns its environment from VITE_APP_ENV.
 * Anything unknown is treated as production so that dev-only behaviour fails closed.
 */
export const APP_ENVS = ['local', 'staging', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

export function parseAppEnv(value: string | undefined | null): AppEnv {
  return (APP_ENVS as readonly string[]).includes(value ?? '') ? (value as AppEnv) : 'production';
}

export function isNonProduction(env: AppEnv): boolean {
  return env !== 'production';
}
