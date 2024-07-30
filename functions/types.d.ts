import type { WorkerEntrypoint } from "cloudflare:workers";

declare interface SendEmailService extends WorkerEntrypoint {
  sendEmail(sender: string, recipient: string, rawContent: string): Promise<void>;
}

export interface Env {
  CF_TURNSTILE_KEY: string,
  SEND_EMAIL: Service<SendEmailService>
}
