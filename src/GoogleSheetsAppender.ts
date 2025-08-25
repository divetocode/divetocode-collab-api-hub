import { google, sheets_v4 } from 'googleapis';

type ValueMode = 'RAW' | 'USER_ENTERED';

type SheetsClientOptions = {
  /** 기본 시트 이름 (기본값: Sheet1) */
  sheetName?: string;
  /** 값 입력 모드 (기본값: RAW) */
  valueInputOption?: ValueMode;
  /** OAuth 스코프 커스터마이즈 */
  scopes?: string[];
};

export class GoogleSheetsAppender {
  private readonly sheets: sheets_v4.Sheets;
  private readonly spreadsheetId: string;
  private readonly defaultSheet: string;
  private readonly valueInputOption: ValueMode;

  constructor(
    clientEmail: string,
    privateKey: string,
    spreadsheetId: string,
    opts: SheetsClientOptions = {}
  ) {
    if (!clientEmail) throw new Error('GoogleSheetsAppender: clientEmail is required');
    if (!privateKey) throw new Error('GoogleSheetsAppender: privateKey is required');
    if (!spreadsheetId) throw new Error('GoogleSheetsAppender: spreadsheetId is required');

    // ENV에 저장된 private key는 종종 \n 이스케이프가 포함됨
    const normalizedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: normalizedKey },
      scopes: opts.scopes ?? ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = spreadsheetId;
    this.defaultSheet = opts.sheetName ?? 'Sheet1';
    this.valueInputOption = opts.valueInputOption ?? 'RAW';
  }

  /** 간단 1행 append (원래 함수 대체) */
  async addRow(data: (string | number | boolean)[], sheetName = this.defaultSheet) {
    const range = this.rangeForWidth(sheetName, data.length);
    try {
      const res = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: this.valueInputOption,
        requestBody: { values: [data] },
      });
      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        `${error}` ||
        'Unknown GoogleSheets API error';
      throw new Error(`Google Sheets API error: ${msg}`);
    }
  }

  /** 여러 행 append */
  async addRows(
    rows: (string | number | boolean)[][],
    sheetName = this.defaultSheet
  ) {
    const maxLen = rows.reduce((m, r) => Math.max(m, r.length), 0) || 1;
    const range = this.rangeForWidth(sheetName, maxLen);

    try {
      const res = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: this.valueInputOption,
        requestBody: { values: rows },
      });
      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        `${error}` ||
        'Unknown GoogleSheets API error';
      throw new Error(`Google Sheets API error: ${msg}`);
    }
  }

  /** 접근성 간단 확인(권한/ID 체크) */
  async verify(): Promise<boolean> {
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'spreadsheetId',
      });
      return true;
    } catch {
      return false;
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  private getColumnName(index: number): string {
    // 1-based index → 'A', 'B', ..., 'Z', 'AA' ...
    let i = Math.max(1, index);
    let result = '';
    while (i > 0) {
      i--;
      result = String.fromCharCode(65 + (i % 26)) + result;
      i = Math.floor(i / 26);
    }
    return result;
  }

  private rangeForWidth(sheetName: string, width: number): string {
    const endCol = this.getColumnName(Math.max(1, width));
    // append는 지정한 range의 열 폭만 참고하고 실제로는 다음 빈 행에 추가됨
    return `${sheetName}!A1:${endCol}1`;
    // 필요시 `${sheetName}!A:${endCol}`로 바꿔도 무방
  }
}
