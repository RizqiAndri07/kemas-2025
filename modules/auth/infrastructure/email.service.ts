import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "localhost";
  const port = parseInt(process.env.SMTP_PORT || "1025", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM || "Kemas Prasasti 2025 <noreply@kemasprasasti.com>"
  );
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * 1. Kirim Email Verifikasi Akun Baru (Berlaku 12 Jam)
 */
export async function sendVerificationEmail({
  to,
  username,
  token,
}: {
  to: string;
  username: string;
  token: string;
}) {
  const transporter = getTransporter();
  const verifyUrl = `${getAppUrl()}/auth/verify?token=${encodeURIComponent(token)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .badge { display: inline-block; padding: 4px 10px; background: #fef3c7; color: #92400e; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25); }
        .notice { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #475569; margin: 20px 0; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        .link-alt { word-break: break-all; color: #2563eb; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kemas Prasasti 2025</h1>
          <p>Portal Kepanitiaan & Dashboard Manajemen</p>
        </div>
        <div class="content">
          <div class="badge">Aktivasi Akun Baru</div>
          <div class="greeting">Halo, @${username}!</div>
          <p>Akun Anda telah didaftarkan oleh Superadmin pada sistem Kemas Prasasti 2025. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun:</p>
          
          <div class="button-wrapper">
            <a href="${verifyUrl}" class="btn" target="_blank">Verifikasi Akun Saya</a>
          </div>

          <div class="notice">
            ⏰ <strong>Masa Berlaku Tautan:</strong> Tautan verifikasi ini hanya berlaku selama <strong>12 jam</strong> sejak email ini dikirimkan. Jika tautan kedaluwarsa, silakan hubungi Superadmin untuk mengirim ulang email verifikasi.
          </div>

          <p style="font-size: 13px; color: #64748b;">Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan membuka tautan berikut di browser Anda:</p>
          <p><a href="${verifyUrl}" class="link-alt">${verifyUrl}</a></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kemas Prasasti. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </div>
    </body>
    </html>
  `;

  return await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Verifikasi Akun Pengguna - Kemas Prasasti 2025",
    html,
  });
}

/**
 * 2. Kirim Email Notifikasi Akun Terverifikasi + Password Acak + Tautan Update Password
 */
export async function sendWelcomeWithRandomPasswordEmail({
  to,
  username,
  randomPassword,
  setupUrl,
}: {
  to: string;
  username: string;
  randomPassword: string;
  setupUrl?: string;
}) {
  const transporter = getTransporter();
  const updateUrl = setupUrl || `${getAppUrl()}/login`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #d1fae5; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .password-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
        .password-title { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px; }
        .password-code { font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: 2px; }
        .button-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.25); }
        .notice { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #991b1b; margin: 20px 0; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Akun Anda Telah Terverifikasi! 🎉</h1>
          <p>Kemas Prasasti 2025</p>
        </div>
        <div class="content">
          <div class="greeting">Selamat, @${username}!</div>
          <p>Email Anda telah berhasil diverifikasi. Akun Anda kini berstatus <strong>Verified</strong> dan dapat digunakan untuk masuk ke dashboard.</p>

          <p>Sistem telah men-generate kata sandi sementara secara otomatis untuk akun Anda:</p>
          
          <div class="password-box">
            <div class="password-title">Kata Sandi Awal / Sementara</div>
            <div class="password-code">${randomPassword}</div>
          </div>

          <div class="button-wrapper">
            <a href="${updateUrl}" class="btn" target="_blank">Perbarui Kata Sandi Saya</a>
          </div>

          <div class="notice">
            🔒 <strong>Saran Keamanan:</strong> Demi keamanan akun Anda, segera ubah kata sandi ini menjadi kata sandi pribadi Anda melalui tautan di atas atau halaman pengaturan akun.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kemas Prasasti. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </div>
    </body>
    </html>
  `;

  return await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Akun Terverifikasi & Kata Sandi Awal - Kemas Prasasti 2025",
    html,
  });
}

/**
 * 3. Kirim Email Reset Kata Sandi oleh Superadmin (Berlaku 12 Jam)
 */
export async function sendResetPasswordEmail({
  to,
  username,
  token,
}: {
  to: string;
  username: string;
  token: string;
}) {
  const transporter = getTransporter();
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #4338ca 0%, #3730a3 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #c7d2fe; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
        .badge { display: inline-block; padding: 4px 10px; background: #ede9fe; color: #6d28d9; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .button-wrapper { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25); }
        .notice { background: #f1f5f9; border-left: 4px solid #6366f1; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #475569; margin: 20px 0; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        .link-alt { word-break: break-all; color: #4f46e5; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Kata Sandi</h1>
          <p>Kemas Prasasti 2025</p>
        </div>
        <div class="content">
          <div class="badge">Permintaan Reset Kata Sandi</div>
          <div class="greeting">Halo, @${username}!</div>
          <p>Superadmin telah mengajukan permintaan pengaturan ulang kata sandi untuk akun Anda. Silakan klik tombol di bawah ini untuk membuat kata sandi baru:</p>
          
          <div class="button-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Atur Ulang Kata Sandi</a>
          </div>

          <div class="notice">
            ⏰ <strong>Masa Berlaku Tautan:</strong> Tautan reset kata sandi ini hanya berlaku selama <strong>12 jam</strong> sejak email ini dikirimkan. Jika Anda tidak merasa meminta ini, Anda dapat mengabaikan email ini.
          </div>

          <p style="font-size: 13px; color: #64748b;">Jika tombol tidak berfungsi, buka tautan berikut di browser:</p>
          <p><a href="${resetUrl}" class="link-alt">${resetUrl}</a></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Kemas Prasasti. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </div>
    </body>
    </html>
  `;

  return await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Permintaan Reset Kata Sandi - Kemas Prasasti 2025",
    html,
  });
}
