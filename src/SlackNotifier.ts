import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

type SlackMessage = {
  text?: string;
  blocks?: unknown[];       // Slack Block Kit payload
  attachments?: unknown[];  // legacy attachments
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
  channel?: string;         // 워크스페이스 설정에 따라 무시될 수 있음
  mrkdwn?: boolean;
};

type SlackNotifierOptions = {
  /** 메시지에 기본적으로 적용할 값들(채널/이름/아이콘 등) */
  defaults?: Omit<SlackMessage, 'text' | 'blocks' | 'attachments'>;
  /** axios 설정(타임아웃, 프록시 등) */
  axios?: AxiosRequestConfig;
};

export class SlackNotifier {
  private readonly webhookUrl: string;
  private readonly client: AxiosInstance;
  private readonly defaults?: SlackNotifierOptions['defaults'];

  constructor(webhookUrl: string, opts: SlackNotifierOptions = {}) {
    if (!webhookUrl) {
      throw new Error('SlackNotifier: webhookUrl is required');
    }
    this.webhookUrl = webhookUrl;
    this.defaults = opts.defaults;
    this.client = axios.create({ timeout: 10_000, ...opts.axios });
  }

  /**
   * 간단 문자열 메시지 전송 (원래 함수 대체)
   */
  async sendNotification(message: string) {
    return this.send({ text: message });
  }

  /**
   * 커스텀 페이로드 전송
   */
  async send(payload: SlackMessage) {
    const body: SlackMessage = { ...(this.defaults ?? {}), ...payload };

    try {
      const res = await this.client.post(this.webhookUrl, body);
      return res.data; // 보통 'ok' 문자열
    } catch (error: any) {
      const errorMessage =
        (error?.response?.data && String(error.response.data)) ||
        error?.message ||
        `${error}` ||
        'Unknown Slack API error';
      throw new Error(`Slack notification failed: ${errorMessage}`);
    }
  }

  /**
   * URL 형식 검증(네트워크 호출 없음)
   * 실사용 보장 X, 단순 패턴 체크용
   */
  validateUrlFormat(): boolean {
    return /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+$/i.test(
      this.webhookUrl
    );
  }

  /**
   * 테스트 핑(실제 메시지를 보냄)
   */
  async ping(text = 'Slack webhook verification ping') {
    return this.send({ text });
  }
}
