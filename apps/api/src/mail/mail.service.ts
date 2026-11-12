import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

/** One labelled line of a notification ("Téléphone : 77 000 00 00"). Empty values are skipped. */
export type MailField = [label: string, value: string | number | null | undefined];

export interface Notification {
  /** Short subject, e.g. "Nouvelle demande de devis" */
  subject: string;
  /** Intro line shown above the details */
  intro: string;
  fields: MailField[];
  /** Back-office path to open the request, e.g. "/admin/messages" */
  adminPath: string;
  /** The visitor's email: notifications get it as Reply-To, and the visitor gets an acknowledgement */
  customerEmail?: string | null;
  /** First line of the acknowledgement sent to the visitor */
  customerMessage?: string;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Sends e-mails through the SMTP account configured in .env (OVH Zimbra: contact@…).
 * Without SMTP settings it stays silent, so local development and tests need nothing.
 * Sending never blocks or breaks a form: failures are only logged.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly notifyTo: string;
  private readonly siteUrl: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = Number(process.env.SMTP_PORT || 465);

    this.from = process.env.EMAIL_FROM || (user ? `Sen Biopest <${user}>` : '');
    this.notifyTo = process.env.NOTIFY_EMAIL || user || '';
    this.siteUrl = (process.env.SITE_URL || process.env.CORS_ORIGIN || '').replace(/\/$/, '');

    if (host === 'log') {
      // Development: print the messages instead of sending them
      this.transporter = createTransport({ jsonTransport: true });
    } else if (host && user && pass) {
      this.transporter = createTransport({
        host,
        port,
        secure: port === 465, // 465 = SSL; 587 = STARTTLS
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.log('E-mails désactivés (SMTP_HOST / SMTP_USER / SMTP_PASS non renseignés)');
    }
  }

  get enabled() {
    return this.transporter !== null && !!this.notifyTo;
  }

  /** Fire-and-forget: alerts the team and acknowledges the visitor. Never throws. */
  notify(notification: Notification): void {
    if (!this.enabled) return;
    void this.deliver(notification).catch((error: unknown) =>
      this.logger.error(`Envoi de l'e-mail « ${notification.subject} » impossible : ${error instanceof Error ? error.message : error}`),
    );
  }

  private async deliver(n: Notification) {
    const fields = n.fields.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
    const adminUrl = this.siteUrl ? `${this.siteUrl}${n.adminPath}` : '';

    const rows = fields
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
          `<td style="padding:6px 0;color:#111827;white-space:pre-wrap">${escapeHtml(String(value))}</td></tr>`,
      )
      .join('');

    const html = this.layout(
      `<p style="margin:0 0 16px">${escapeHtml(n.intro)}</p>
       <table style="border-collapse:collapse;font-size:14px">${rows}</table>
       ${adminUrl ? `<p style="margin:24px 0 0"><a href="${adminUrl}" style="background:#107434;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Ouvrir dans l'administration</a></p>` : ''}`,
    );
    const text = [n.intro, '', ...fields.map(([l, v]) => `${l} : ${v}`), '', adminUrl].join('\n');

    const info = await this.transporter!.sendMail({
      from: this.from,
      to: this.notifyTo,
      replyTo: n.customerEmail || undefined,
      subject: `[Site] ${n.subject}`,
      html,
      text,
    });
    if (process.env.SMTP_HOST === 'log') this.logger.log(`E-mail (non envoyé) : ${info.message}`);

    if (n.customerEmail) {
      const thanks =
        n.customerMessage || 'Nous avons bien reçu votre demande et nous vous répondrons dans les meilleurs délais.';
      await this.transporter!.sendMail({
        from: this.from,
        to: n.customerEmail,
        replyTo: this.notifyTo,
        subject: 'Sen Biopest — nous avons bien reçu votre demande',
        html: this.layout(
          `<p style="margin:0 0 12px">Bonjour,</p>
           <p style="margin:0 0 12px">${escapeHtml(thanks)}</p>
           <p style="margin:0 0 12px">Pour toute précision, répondez simplement à cet e-mail.</p>
           <p style="margin:0">L'équipe Sen Biopest</p>`,
        ),
        text: `Bonjour,\n\n${thanks}\n\nPour toute précision, répondez simplement à cet e-mail.\n\nL'équipe Sen Biopest`,
      });
    }
  }

  private layout(body: string) {
    return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#107434;color:#fff;padding:16px 20px;border-radius:10px 10px 0 0;font-weight:bold;font-size:18px">Sen Biopest</div>
      <div style="border:1px solid #e5e7eb;border-top:0;padding:20px;border-radius:0 0 10px 10px;line-height:1.5">${body}</div>
    </div>`;
  }
}
