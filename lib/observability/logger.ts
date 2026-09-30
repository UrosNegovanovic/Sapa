type LogContext = Record<string, boolean | number | string | null | undefined>;

function write(
  level: "error" | "info" | "warn",
  event: string,
  context: LogContext = {},
) {
  const payload = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  });

  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

export const logger = {
  error: (event: string, context?: LogContext) =>
    write("error", event, context),
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
};
