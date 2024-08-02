import type { Env } from "../types";
import { createMimeMessage, Mailbox } from "mimetext/browser";
import { z } from "zod";

const ContactFormResponse = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  message: z.string().trim().min(1)
});

const response = (status: number, response: any) =>
  new Response(JSON.stringify(response), { status });

export const onRequestPost: PagesFunction<Env> = async ctx => {
  const data = await ctx.request.formData();

  const turnstileResponse = data.get("cf-turnstile-response");
  const ip = ctx.request.headers.get("CF-Connecting-IP");
  const country = ctx.request.headers.get("CF-IPCountry");

  // verify the turnstile key
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
    const dataObj = Object.fromEntries(data.entries());
    const parseResult = ContactFormResponse.safeParse(dataObj);
    if (parseResult.success) {
      // prepare the email

      const email = createMimeMessage();
      email.setSender({
        addr: "noreply@kameswar.com",
        name: `${parseResult.data.email} via contact form`,
      });
      email.setRecipient("siddhant@kameswar.com");
      email.setSubject("Contact form response");
      email.setHeader("Reply-To", new Mailbox({
        addr: parseResult.data.email,
        name: parseResult.data.name
      }));

      email.addMessage({
        contentType: "text/html",
        data: `<h2>New contact form response</h2>
<h3>Message:</h3>
<p>${parseResult.data.message}</p>

<h3>Info:</h3>
<p><strong>Name:</strong> ${parseResult.data.name}</p>
<p><strong>Email:</strong> ${parseResult.data.email}</p>
<p><strong>Country:</strong> ${country}</p>`
      });

      await ctx.env.SEND_EMAIL.sendEmail("noreply@kameswar.com", "siddhant@kameswar.com", email.asRaw());

      return response(200, { success: true });
    } else {
      return response(400, { error: parseResult.error.format() });
    }
  } else {
    return response(401, { error: "failed turnstile verification" });
  }
};
