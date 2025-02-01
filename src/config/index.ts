export const config = {
  port: Number(process.env.PORT) || 3000,
  baseUrl: process.env.BASE_URL || "http://localhost:3000",

  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("JWT_SECRET must be set in production");
        })()
      : "your-secret-key"),
  jwtExpiry: process.env.JWT_EXPIRY || "24h",

  emailVerificationExpiry:
    Number(process.env.EMAIL_VERIFICATION_EXPIRY) || 24 * 60 * 60 * 1000,
  passwordResetExpiry:
    Number(process.env.PASSWORD_RESET_EXPIRY) || 1 * 60 * 60 * 1000,

  email: {
    from: process.env.EMAIL_FROM || "noreply@example.com",
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
    port: Number(process.env.EMAIL_PORT) || 2525,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    secure: process.env.NODE_ENV === "production",
  },
} as const;
