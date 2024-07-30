import type { Env } from "../types";
import { createMimeMessage, Mailbox } from "mimetext/browser";

export const onRequestPost: PagesFunction<Env> = async ctx => {
  const data = await ctx.request.formData();

  const turnstileResponse = data.get("cf-turnstile-response");
  const ip = ctx.request.headers.get("CF-Connecting-IP");

  const turnstileResult = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    body: JSON.stringify({
      secret: ctx.env.CF_TURNSTILE_KEY,
      response: turnstileResponse,
      remoteip: ip
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(r => r.json<{ success: boolean }>());

  if (turnstileResult.success) {
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");

    // TODO: validate email

    if (name && email && message) {
      // TODO: send me an email
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "missing required fields" }),
        {
          status: 400
        }
      );
    }
  } else {
    return new Response(
      JSON.stringify({ error: "failed turnstile verification" }),
      {
        status: 401
      }
    );
  }
};
