type EnvMap = Record<string, string | undefined>

function readEnv(): EnvMap {
  const runtime = globalThis as unknown as { process?: { env?: EnvMap } }
  return runtime.process?.env ?? {}
}

export function getRuntimeEnv(name: string): string | undefined {
  return readEnv()[name]
}
