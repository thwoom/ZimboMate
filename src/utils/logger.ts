/* eslint-disable no-console */

const isDevelopment = Boolean(import.meta.env?.DEV)

const formatArgs = (args: unknown[]) => args

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment)
      console.debug(...formatArgs(args))
  },
  info: (...args: unknown[]) => {
    if (isDevelopment)
      console.info(...formatArgs(args))
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment)
      console.warn(...formatArgs(args))
  },
  error: (...args: unknown[]) => {
    console.error(...formatArgs(args))
  },
}
