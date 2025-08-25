import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

type TelegramMessage = {
  text?: string;
  parse_mode?: 'MarkdownV2' | 'Markdown' | 'HTML';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  reply_to_message_id?: number;
  reply_markup?: unknown;      // inline_keyboard 등
  message_thread_id?: number;  // 토픽 지원(슈퍼그룹)
};

type TelegramNotifierOptions = {
  /** axios 커스터마이즈(타임아웃/프록시 등) */
  axios?: AxiosRequestConfig;
  /** send 호출 시 기본으로 합쳐줄 값들 */
  defaults?: Omit<TelegramMessage, 'text'>;
  /** 기본 API 호스트 변경이 필요할 때 */
  baseUrl?: string; // 기본값: https://api.telegram.org
};

export class TelegramNotifier {
  private readonly token: string;
  private readonly defaultChatId: string;
  private readonly client: AxiosInstance;
  private readonly defaults?: TelegramNotifierOptions['defaults'];

  constructor(token: string, chatId: string, opts: TelegramNotifierOptions = {}) {
    if (!token) throw new Error('TelegramNotifier: token is required');
    if (!chatId) throw new Error('TelegramNotifier: chatId is required');

    this.token = token;
    this.defaultChatId = chatId;
    this.defaults = opts.defaults;

    const base = (opts.baseUrl ?? 'https://api.telegram.org').replace(/\/$/, '');
    this.client = axios.create({
      baseURL: `${base}/bot${token}`,
      timeout: 10_000,
      ...opts.axios,
    });
  }

  /** 간단 문자열 전송 (원래 함수 대체) */
  async sendNotification(message: string) {
    return this.send({ text: message });
  }

  /**
   * 커스텀 페이로드 전송
   * @param payload chat_id를 넘기지 않으면 생성자에 준 기본 chatId 사용
   */
  async send(payload: TelegramMessage & { chat_id?: string | number }) {
    const body = {
      chat_id: payload.chat_id ?? this.defaultChatId,
      ...this.defaults,
      ...payload,
    };

    try {
      const res = await this.client.post('/sendMessage', body);
      return res.data; // 성공 시 Telegram API 응답(JSON)
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.description ||
        error?.message ||
        `${error}` ||
        'Unknown Telegram API error';
      throw new Error(`Telegram notification failed: ${errorMessage}`);
    }
  }

  /** 토큰 대략적 형식 확인(네트워크 호출 X) */
  validateTokenFormat(): boolean {
    // 예시 패턴: 123456789:AA... (대략 체크)
    return /^\d+:[A-Za-z0-9_-]{20,}$/.test(this.token);
  }

  /** 핑(테스트 메시지) */
  async ping(text = 'Telegram webhook verification ping') {
    return this.send({ text });
  }
}
