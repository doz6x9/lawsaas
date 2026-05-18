import { SMTPServer } from 'smtp-server';

const PORT = parseInt(process.env.LOCAL_SMTP_PORT || '2525');

// In-memory store for received emails
export const receivedEmails: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  receivedAt: Date;
}[] = [];

/**
 * Starts a local SMTP server for testing email sending without an actual SMTP provider.
 * Emails received by this server are stored in memory.
 */
export function startLocalSmtpServer() {
  const smtpServer = new SMTPServer({
    allowInsecureAuth: true, // Allow plain text authentication for local testing
    authOptional: true,      // No authentication required for local testing
    onConnect(session: any, callback: any) {
      console.log(`[Local SMTP] Client connected: ${session.remoteAddress}`);
      callback(); // Accept the connection
    },
    onMailFrom(address: any, session: any, callback: any) {
      console.log(`[Local SMTP] Mail from: ${address.address}`);
      callback(); // Accept the address
    },
    onRcptTo(address: any, session: any, callback: any) {
      console.log(`[Local SMTP] Mail to: ${address.address}`);
      callback(); // Accept the address
    },
    onData(stream: any, session: any, callback: any) {
      let emailContent = '';
      stream.on('data', (chunk: any) => (emailContent += chunk.toString()));
      stream.on('end', () => {
        try {
          // Basic parsing to extract subject, from, to, and body
          const fromMatch = emailContent.match(/From: (.*)\n/);
          const toMatch = emailContent.match(/To: (.*)\n/);
          const subjectMatch = emailContent.match(/Subject: (.*)\n/);

          // For HTML/Text content, this is a very basic extraction.
          const htmlMatch = emailContent.match(/Content-Type: text\/html;.*?\n\n([\s\S]*?)(?=\n--_)/i);
          const textMatch = emailContent.match(/Content-Type: text\/plain;.*?\n\n([\s\S]*?)(?=\n--_)/i);

          receivedEmails.push({
            from: fromMatch ? fromMatch[1].trim() : 'unknown',
            to: toMatch ? toMatch[1].trim() : 'unknown',
            subject: subjectMatch ? subjectMatch[1].trim() : 'No Subject',
            html: htmlMatch ? htmlMatch[1].trim() : '',
            text: textMatch ? textMatch[1].trim() : '',
            receivedAt: new Date(),
          });
          console.log(`[Local SMTP] Received email from ${fromMatch ? fromMatch[1] : 'unknown'} to ${toMatch ? toMatch[1] : 'unknown'} (Subject: ${subjectMatch ? subjectMatch[1] : 'No Subject'})`);
          callback();
        } catch (err) {
          console.error('[Local SMTP] Error parsing received email:', err);
          callback(new Error('Failed to parse email'));
        }
      });
    },
    onClose(session: any) {
      console.log(`[Local SMTP] Client disconnected: ${session.remoteAddress}`);
    },
    onError(err: any) {
      console.error('[Local SMTP] Server error:', err);
    }
  });

  smtpServer.listen(PORT, () => {
    console.log(`[Local SMTP] Test SMTP server listening on port ${PORT}. Emails will be stored in memory.`);
    console.log(`[Local SMTP] To view received emails, GET /api/test/emails`);
  });

  return smtpServer;
}

/**
 * Clears all stored emails from the in-memory array.
 */
export function clearReceivedEmails() {
  receivedEmails.length = 0; // Clear the array
  console.log('[Local SMTP] Cleared all received emails from memory.');
}
