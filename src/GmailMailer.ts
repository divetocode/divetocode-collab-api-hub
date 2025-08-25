import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

export class GmailMailer {
  private transporter: Transporter;
  private readonly user: string;

  constructor(user: string, pass: string) {
    if (!user || !pass) {
      throw new Error('GmailMailer: user and pass are required');
    }
    this.user = user;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  /**
   * 간단 메시지 전송 (원래 함수와 동일한 시그니처)
   */
  async sendEmail(message: string): Promise<SentMessageInfo> {
    return this.send({
      text: message,
      subject: 'Your Customer Information',
      to: this.user,
      from: this.user,
    });
  }

  /**
   * 옵션형 전송(필요 시 수신자/제목/HTML 등 커스터마이즈)
   */
  async send(opts: {
    to?: string;
    from?: string;
    subject?: string;
    text?: string;
    html?: string;
  }): Promise<SentMessageInfo> {
    const mailOptions = {
      from: opts.from ?? this.user,
      to: opts.to ?? this.user,
      subject: opts.subject ?? 'Your Customer Information',
      text: opts.text,
      html: opts.html,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      const msg = error?.message || `${error}` || 'Unknown gmail sending error';
      throw new Error(`Gmail Email sending failed: ${msg}`);
    }
  }

  /** 연결 검증용(선택) */
  async verify(): Promise<void> {
    await this.transporter.verify();
  }
}
