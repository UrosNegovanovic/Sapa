import { logger } from "@/lib/observability/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logger.info("application.started", { runtime: process.env.NEXT_RUNTIME });
  }

  if (process.env.SENTRY_DSN) {
    logger.info("observability.sentry_configured");
  }
}
