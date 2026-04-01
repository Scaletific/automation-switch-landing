type EnvMap = Record<string, string | undefined>

function readEnvMap(): EnvMap {
  const runtime = globalThis as unknown as { process?: { env?: EnvMap } }
  return runtime.process?.env ?? {}
}

export function getEnv(name: string): string | undefined {
  return readEnvMap()[name]
}
