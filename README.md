# @divetocode/collab-api-hub

A comprehensive TypeScript library for seamless integration with popular communication and data management services. Send emails via Gmail, manage Google Sheets data, post Slack notifications, and send Telegram messages with ease.

## 📦 Installation

```bash
npm install @divetocode/collab-api-hub
```

The library automatically includes all necessary peer dependencies, but you may need to install them separately depending on your setup:

```bash
npm install nodemailer googleapis axios
npm install -D @types/nodemailer
```

## 🚀 Features

- **GmailMailer**: Send emails through Gmail SMTP
- **GoogleSheetsAppender**: Add data rows to Google Sheets
- **SlackNotifier**: Send messages via Slack webhooks
- **TelegramNotifier**: Send messages via Telegram Bot API

## 📋 Quick Import

```typescript
import { 
  GmailMailer, 
  GoogleSheetsAppender, 
  SlackNotifier, 
  TelegramNotifier 
} from '@divetocode/collab-api-hub';
```

Or import individual classes:

```typescript
import { GmailMailer } from '@divetocode/collab-api-hub';
import { SlackNotifier } from '@divetocode/collab-api-hub';
```

---

## 📧 GmailMailer

Send emails using Gmail SMTP with app passwords.

### Setup Requirements

1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated 16-character app password

### Basic Usage

```typescript
import { GmailMailer } from '@divetocode/collab-api-hub';

const mailer = new GmailMailer(
  'your-email@gmail.com',
  'your-app-password'  // 16-character app password
);

// Send simple text message
await mailer.sendEmail('Hello! This is a test message.');

// Send with custom options
await mailer.send({
  to: 'recipient@example.com',
  subject: 'Important Notification',
  text: 'Text content',
  html: '<h1>HTML content</h1>'
});

// Verify connection
await mailer.verify();
```

### Methods

- `sendEmail(message: string)`: Send simple text message
- `send(opts)`: Send email with detailed options
  - `to?`: Recipient (defaults to sender)
  - `from?`: Sender (defaults to constructor email)
  - `subject?`: Subject line (default: "Your Customer Information")
  - `text?`: Plain text content
  - `html?`: HTML content
- `verify()`: Verify SMTP connection

---

## 📊 GoogleSheetsAppender

Add data to Google Sheets using the Google Sheets API.

### Setup Requirements

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Create a service account and download the JSON key
4. Share your spreadsheet with the service account email

### Basic Usage

```typescript
import { GoogleSheetsAppender } from '@divetocode/collab-api-hub';

const sheets = new GoogleSheetsAppender(
  'service-account@project.iam.gserviceaccount.com',
  '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', // Spreadsheet ID
  {
    sheetName: 'Sheet1',
    valueInputOption: 'RAW'
  }
);

// Add single row
await sheets.addRow(['Name', 'Email', 'Age'], 'Sheet1');
await sheets.addRow(['John Doe', 'john@example.com', 30]);

// Add multiple rows at once
await sheets.addRows([
  ['Alice Smith', 'alice@example.com', 25],
  ['Bob Johnson', 'bob@example.com', 28],
  ['Carol Brown', 'carol@example.com', 32]
]);

// Verify access permissions
const isAccessible = await sheets.verify();
console.log('Sheet accessible:', isAccessible);
```

### Environment Variables Example

```typescript
// The library automatically handles \n escape characters in private keys
const sheets = new GoogleSheetsAppender(
  process.env.GOOGLE_CLIENT_EMAIL!,
  process.env.GOOGLE_PRIVATE_KEY!,
  process.env.GOOGLE_SHEET_ID!
);
```

### Methods

- `addRow(data, sheetName?)`: Add single row
- `addRows(rows, sheetName?)`: Add multiple rows
- `verify()`: Verify spreadsheet access permissions

### Configuration Options

- `sheetName`: Default sheet name (default: 'Sheet1')
- `valueInputOption`: Value input mode ('RAW' or 'USER_ENTERED')
- `scopes`: Custom OAuth scopes

---

## 💬 SlackNotifier

Send messages to Slack channels using Incoming Webhooks.

### Setup Requirements

1. Enable Incoming Webhooks in your Slack app
2. Select a channel and generate webhook URL

### Basic Usage

```typescript
import { SlackNotifier } from '@divetocode/collab-api-hub';

const slack = new SlackNotifier(
  'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
  {
    defaults: {
      username: 'Notification Bot',
      icon_emoji: ':robot_face:',
      channel: '#general'
    }
  }
);

// Send simple text message
await slack.sendNotification('Hello, Slack!');

// Send custom message
await slack.send({
  text: 'Important alert!',
  username: 'System',
  icon_emoji: ':warning:',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Important Alert*\nSystem maintenance completed.'
      }
    }
  ]
});

// Validate webhook URL format
const isValidUrl = slack.validateUrlFormat();

// Test connection
await slack.ping('Test message');
```

### Methods

- `sendNotification(message: string)`: Send simple text message
- `send(payload)`: Send message with detailed options
- `validateUrlFormat()`: Validate webhook URL format
- `ping(text?)`: Send test message

### Message Options

- `text`: Message text
- `blocks`: Slack Block Kit blocks
- `attachments`: Legacy attachments
- `username`: Bot display name
- `icon_emoji`: Emoji icon
- `icon_url`: Image URL icon
- `channel`: Target channel (may be ignored by workspace settings)

---

## 🤖 TelegramNotifier

Send messages using the Telegram Bot API.

### Setup Requirements

1. Chat with [@BotFather](https://t.me/botfather) to create a bot
2. Get your bot token
3. Add the bot to your channel/group or start a private chat
4. Get the chat ID

### Getting Chat ID

```bash
# Send a message to your bot, then check:
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

### Basic Usage

```typescript
import { TelegramNotifier } from '@divetocode/collab-api-hub';

const telegram = new TelegramNotifier(
  '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw', // Bot token
  '-1001234567890', // Chat ID
  {
    defaults: {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    }
  }
);

// Send simple text message
await telegram.sendNotification('Hello, Telegram!');

// Send Markdown formatted message
await telegram.send({
  text: '*Important Alert*\n\nSystem is running normally.',
  parse_mode: 'Markdown'
});

// Send HTML formatted message
await telegram.send({
  text: '<b>System Alert</b>\n\n<code>Server status: OK</code>',
  parse_mode: 'HTML'
});

// Send to different chat
await telegram.send({
  chat_id: '-1009876543210',
  text: 'Message to different group'
});

// Validate token format
const isValidToken = telegram.validateTokenFormat();

// Test connection
await telegram.ping('Test message');
```

### Methods

- `sendNotification(message: string)`: Send simple text message
- `send(payload)`: Send message with detailed options
- `validateTokenFormat()`: Validate bot token format
- `ping(text?)`: Send test message

### Message Options

- `text`: Message text
- `parse_mode`: Parsing mode ('Markdown', 'MarkdownV2', 'HTML')
- `disable_web_page_preview`: Disable web page previews
- `disable_notification`: Send silently
- `reply_to_message_id`: Reply to specific message
- `message_thread_id`: Topic ID (for supergroups)
- `chat_id`: Chat ID (overrides default)

---

## 🔧 Complete Integration Example

Build a comprehensive notification system using all classes together:

```typescript
import { 
  GmailMailer, 
  GoogleSheetsAppender, 
  SlackNotifier, 
  TelegramNotifier 
} from '@divetocode/collab-api-hub';

class NotificationHub {
  private gmail: GmailMailer;
  private sheets: GoogleSheetsAppender;
  private slack: SlackNotifier;
  private telegram: TelegramNotifier;

  constructor(config: {
    gmail: { user: string; pass: string };
    sheets: { clientEmail: string; privateKey: string; spreadsheetId: string };
    slack: { webhookUrl: string };
    telegram: { token: string; chatId: string };
  }) {
    this.gmail = new GmailMailer(config.gmail.user, config.gmail.pass);
    this.sheets = new GoogleSheetsAppender(
      config.sheets.clientEmail,
      config.sheets.privateKey,
      config.sheets.spreadsheetId
    );
    this.slack = new SlackNotifier(config.slack.webhookUrl);
    this.telegram = new TelegramNotifier(
      config.telegram.token,
      config.telegram.chatId
    );
  }

  async processCustomerInquiry(customerData: {
    name: string;
    email: string;
    message: string;
  }) {
    const { name, email, message } = customerData;

    try {
      // 1. Save to Google Sheets
      await this.sheets.addRow([
        new Date().toISOString(),
        name,
        email,
        message
      ]);

      // 2. Send confirmation email
      await this.gmail.send({
        to: email,
        subject: 'Inquiry Received - We\'ll Get Back to You Soon',
        html: `
          <h2>Hello ${name}!</h2>
          <p>Thank you for contacting us. We've received your inquiry and will respond within 24 hours.</p>
          <hr>
          <p><strong>Your message:</strong> ${message}</p>
          <p>Best regards,<br>Customer Support Team</p>
        `
      });

      // 3. Notify team via Slack
      await this.slack.send({
        text: `New customer inquiry received!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New Customer Inquiry* 🔔\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Reply via Email' },
                url: `mailto:${email}?subject=Re: Your Inquiry`
              }
            ]
          }
        ]
      });

      // 4. Send alert via Telegram
      await this.telegram.send({
        text: `🔔 *New Customer Inquiry*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}\n\n_Confirmation email sent automatically_`,
        parse_mode: 'Markdown'
      });

      return { success: true, message: 'Inquiry processed successfully' };

    } catch (error) {
      // Error notification
      await this.telegram.send({
        text: `❌ *Error Processing Inquiry*\n\nCustomer: ${name} (${email})\nError: ${error.message}`,
        parse_mode: 'Markdown'
      });
      
      throw error;
    }
  }

  async healthCheck(): Promise<{
    gmail: boolean;
    sheets: boolean;
    slack: boolean;
    telegram: boolean;
  }> {
    const results = {
      gmail: false,
      sheets: false,
      slack: false,
      telegram: false
    };

    // Test Gmail connection
    try {
      await this.gmail.verify();
      results.gmail = true;
    } catch (error) {
      console.error('Gmail connection failed:', error.message);
    }

    // Test Google Sheets access
    try {
      results.sheets = await this.sheets.verify();
    } catch (error) {
      console.error('Google Sheets access failed:', error.message);
    }

    // Validate Slack webhook
    try {
      results.slack = this.slack.validateUrlFormat();
      if (results.slack) {
        await this.slack.ping('Health check ping');
      }
    } catch (error) {
      console.error('Slack validation failed:', error.message);
      results.slack = false;
    }

    // Validate Telegram bot
    try {
      results.telegram = this.telegram.validateTokenFormat();
      if (results.telegram) {
        await this.telegram.ping('Health check ping');
      }
    } catch (error) {
      console.error('Telegram validation failed:', error.message);
      results.telegram = false;
    }

    return results;
  }

  async sendDailyReport(data: {
    totalInquiries: number;
    respondedCount: number;
    pendingCount: number;
  }) {
    const { totalInquiries, respondedCount, pendingCount } = data;
    const responseRate = ((respondedCount / totalInquiries) * 100).toFixed(1);

    // Send to Slack
    await this.slack.send({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Daily Customer Support Report'
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Total Inquiries:*\n${totalInquiries}` },
            { type: 'mrkdwn', text: `*Responded:*\n${respondedCount}` },
            { type: 'mrkdwn', text: `*Pending:*\n${pendingCount}` },
            { type: 'mrkdwn', text: `*Response Rate:*\n${responseRate}%` }
          ]
        }
      ]
    });

    // Send to Telegram
    await this.telegram.send({
      text: `📊 *Daily Support Report*\n\n📋 Total: ${totalInquiries}\n✅ Responded: ${respondedCount}\n⏳ Pending: ${pendingCount}\n📈 Response Rate: ${responseRate}%`,
      parse_mode: 'Markdown'
    });
  }
}

// Usage Example
const hub = new NotificationHub({
  gmail: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!
  },
  sheets: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL!,
    privateKey: process.env.GOOGLE_PRIVATE_KEY!,
    spreadsheetId: process.env.GOOGLE_SHEET_ID!
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL!
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN!,
    chatId: process.env.TELEGRAM_CHAT_ID!
  }
});

// Process customer inquiry
await hub.processCustomerInquiry({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'I have a question about your product pricing.'
});

// Check system health
const health = await hub.healthCheck();
console.log('System Health:', health);

// Send daily report
await hub.sendDailyReport({
  totalInquiries: 25,
  respondedCount: 22,
  pendingCount: 3
});
```

## 🔐 Environment Configuration

Create a `.env` file with the following variables:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Google Sheets Configuration
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX

# Telegram Configuration
TELEGRAM_BOT_TOKEN=123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
TELEGRAM_CHAT_ID=-1001234567890
```

## 📝 Error Handling

All classes provide clear error messages for debugging:

```typescript
try {
  await mailer.sendEmail('Test message');
} catch (error) {
  console.error('Email sending failed:', error.message);
  // Example: "Gmail Email sending failed: Invalid login: 534-5.7.14"
}

try {
  await sheets.addRow(['data']);
} catch (error) {
  console.error('Sheet update failed:', error.message);
  // Example: "Google Sheets API error: The caller does not have permission"
}

// Implement retry logic for better reliability
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('This should never be reached');
}

// Usage with retry logic
await withRetry(() => 
  slack.sendNotification('Important message with retry logic')
);
```

## 🔧 Development Tips

### TypeScript Support
```typescript
import type { SentMessageInfo } from 'nodemailer';
import { GmailMailer } from '@divetocode/collab-api-hub';

const mailer = new GmailMailer('email', 'password');
const result: SentMessageInfo = await mailer.sendEmail('Hello');
```

### Connection Health Monitoring
```typescript
// Monitor all services periodically
setInterval(async () => {
  const health = await hub.healthCheck();
  const unhealthyServices = Object.entries(health)
    .filter(([_, isHealthy]) => !isHealthy)
    .map(([service]) => service);
  
  if (unhealthyServices.length > 0) {
    console.warn(`Unhealthy services: ${unhealthyServices.join(', ')}`);
  }
}, 60000); // Check every minute
```

### Batch Operations
```typescript
// Process multiple operations efficiently
const inquiries = [
  { name: 'Alice', email: 'alice@example.com', message: 'Question 1' },
  { name: 'Bob', email: 'bob@example.com', message: 'Question 2' }
];

// Add all to sheets in one operation
const sheetData = inquiries.map(inquiry => [
  new Date().toISOString(),
  inquiry.name,
  inquiry.email,
  inquiry.message
]);

await sheets.addRows(sheetData);

// Send notifications in parallel
await Promise.allSettled(
  inquiries.map(inquiry => 
    hub.processCustomerInquiry(inquiry)
  )
);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@divetocode/collab-api-hub)
- [GitHub Repository](https://github.com/divetocode/collab-api-hub)
- [Documentation](https://docs.divetocode.com/collab-api-hub)

## 📞 Support

For support and questions, please open an issue on GitHub or contact us at support@divetocode.com.