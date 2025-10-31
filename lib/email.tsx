export interface EmailMessage {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  try {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const fromEmail = process.env.SMTP_FROM_EMAIL
    const fromName = process.env.SMTP_FROM_NAME || "Secret Santa"

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !fromEmail) {
      console.error("[v0] SMTP credentials not configured")
      return false
    }

    // For ZeptoMail and other SMTP services
    const response = await fetch(`https://${smtpHost}/v1/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${smtpPassword}`,
      },
      body: JSON.stringify({
        from: {
          address: fromEmail,
          name: fromName,
        },
        to: [
          {
            email_address: {
              address: message.to,
            },
          },
        ],
        subject: message.subject,
        htmlbody: message.html,
        textbody: message.text || message.html.replace(/<[^>]*>/g, ""),
      }),
    })

    if (!response.ok) {
      console.error("[v0] Email API error:", await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return false
  }
}

export function generatePairingEmail(participantName: string, eventTitle: string, pairingLink: string): EmailMessage {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626 0%, #16A34A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #16A34A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎅 Secret Santa 🎄</h1>
            <h2>${eventTitle}</h2>
          </div>
          <div class="content">
            <p>Hello ${participantName}!</p>
            <p>You've been invited to participate in a Secret Santa gift exchange!</p>
            <p>Click the button below to reveal your Secret Santa pairing:</p>
            <p style="text-align: center;">
              <a href="${pairingLink}" class="button">View Your Pairing</a>
            </p>
            <p>Or copy this link: <br><code>${pairingLink}</code></p>
            <p>Remember to keep it secret! 🤫</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Secret Santa App</p>
          </div>
        </div>
      </body>
    </html>
  `

  return {
    to: "",
    subject: `🎅 ${eventTitle} - Your Secret Santa Pairing`,
    html,
    text: `Hello ${participantName}!\n\nYou've been invited to participate in ${eventTitle}!\n\nView your pairing here: ${pairingLink}\n\nRemember to keep it secret!`,
  }
}
