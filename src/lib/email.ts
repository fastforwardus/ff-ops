import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? "FastForward <no-reply@fastfwdus.com>"

export async function sendAssignmentEmail({
  toEmail, toName, clientName, serviceLabel, urgency, submissionId,
}: {
  toEmail: string; toName: string; clientName: string
  serviceLabel: string; urgency: string; submissionId: string
}) {
  const urgencyLabel = urgency === "critical" ? "⚡ CRÍTICO" : urgency === "high" ? "↑ Alto" : "Normal"
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/ops/queue`

  await resend.emails.send({
    from:    FROM,
    to:      toEmail,
    subject: `[FF Ops] Nuevo trámite asignado — ${clientName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="padding:32px 0 16px">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.03em">FastForward</span>
          <span style="color:#aaa;font-weight:300"> Ops</span>
        </div>
        <div style="background:#f9f9f8;border:1px solid #ebebeb;border-radius:12px;padding:24px;margin-bottom:24px">
          <div style="font-size:13px;color:#888;margin-bottom:4px">Te asignaron un trámite</div>
          <div style="font-size:20px;font-weight:600;margin-bottom:16px">${clientName}</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr><td style="color:#888;padding:6px 0;width:140px">Servicio</td><td style="font-weight:500">${serviceLabel}</td></tr>
            <tr><td style="color:#888;padding:6px 0">Urgencia</td><td style="font-weight:600;color:${urgency==="critical"?"#cc2020":urgency==="high"?"#c8900a":"#666"}">${urgencyLabel}</td></tr>
          </table>
        </div>
        <a href="${url}" style="display:inline-block;padding:11px 22px;background:#111;color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:500">
          Ver en la cola →
        </a>
        <div style="margin-top:32px;font-size:11px;color:#bbb">FastForward LLC · Miami, FL</div>
      </div>
    `,
  })
}

export async function sendClientMessage({
  toEmail, clientName, body, lang,
}: {
  toEmail: string; clientName: string; body: string; lang: "es" | "en"; submissionId: string
}) {
  const subject = lang === "es"
    ? "Tu asesor de FastForward te envió un mensaje"
    : "Your FastForward advisor sent you a message"
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal`

  await resend.emails.send({
    from:    FROM,
    to:      toEmail,
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="padding:32px 0 16px">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.03em">FastForward</span>
          <span style="color:#aaa;font-weight:300"> Portal</span>
        </div>
        <div style="background:#f9f9f8;border:1px solid #ebebeb;border-radius:12px;padding:24px;margin-bottom:24px">
          <div style="font-size:13px;color:#888;margin-bottom:12px">
            ${lang === "es" ? `Hola ${clientName},` : `Hi ${clientName},`}
          </div>
          <div style="font-size:15px;line-height:1.7;white-space:pre-wrap">${body}</div>
        </div>
        <a href="${portalUrl}" style="display:inline-block;padding:11px 22px;background:#111;color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:500">
          ${lang === "es" ? "Ver mi portal →" : "View my portal →"}
        </a>
        <div style="margin-top:32px;font-size:11px;color:#bbb">FastForward LLC · Miami, FL</div>
      </div>
    `,
  })
}

export async function sendClientWelcomeEmail({
  toEmail, companyName, portalUrl,
}: {
  toEmail: string; companyName: string; portalUrl: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      toEmail,
    subject: `FastForward — Acceso a tu portal de trámites`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#111">
        <div style="padding:32px 0 16px">
          <span style="font-size:18px;font-weight:700;letter-spacing:-0.03em">FastForward</span>
          <span style="color:#aaa;font-weight:300"> Ops</span>
        </div>
        <div style="background:#f9f9f8;border:1px solid #ebebeb;border-radius:12px;padding:24px;margin-bottom:24px">
          <div style="font-size:20px;font-weight:600;margin-bottom:8px">Bienvenido, ${companyName}</div>
          <div style="font-size:13px;color:#666;margin-bottom:20px">Tu trámite fue registrado en FastForward. Podés seguir el estado en tu portal:</div>
          <a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none">Ver mi portal →</a>
        </div>
        <div style="font-size:11px;color:#aaa">FastForward LLC · Miami, FL</div>
      </div>
    `,
  })
}
