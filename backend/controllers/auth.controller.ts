import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../middleware/error";
import { comparePassword, hashPassword, signAccessToken } from "../lib/auth";
import { getMailer } from "../lib/mailer";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resendSchema = z.object({
  email: z.string().email(),
});

function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return new OAuth2Client(clientId, clientSecret, process.env.GOOGLE_REDIRECT_URI);
  }
  return null;
}

function publicUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "ADMIN";
  emailVerified: boolean;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? user.email.split("@")[0],
    role: user.role,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
  };
}

async function sendVerificationEmail(email: string, token: string) {
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const verifyUrl = `${process.env.API_PUBLIC_URL ?? "http://localhost:5000"}/api/auth/verify-email?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(frontendUrl)}`;
  const mailer = getMailer();

  if (!mailer) {
    console.warn(`SMTP not configured. Verification link for ${email}: ${verifyUrl}`);
    return;
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Verify your email",
    text: `Verify your Mudraa account: ${verifyUrl}`,
    html: `<p>Verify your Mudraa account by clicking <a href="${verifyUrl}">this link</a>.</p>`,
  });
}

export const register = () =>
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await hashPassword(data.password);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        authProvider: "LOCAL",
        role: "STUDENT",
        emailVerificationToken,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendVerificationEmail(user.email, emailVerificationToken);

    res.status(201).json({
      message: "Account created. Check your email to verify your account.",
      user: publicUser(user),
    });
  });

export const login = () =>
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.passwordHash) {
      throw new HttpError(401, "Invalid credentials");
    }

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid credentials");
    }

    if (!user.emailVerified) {
      throw new HttpError(403, "Please verify your email before signing in");
    }

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: publicUser(user) });
  });

export const me = () =>
  asyncHandler(async (req, res) => {
    const authHeader = req.header("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required");
    }

    const token = authHeader.slice(7);
    const { verifyAccessToken } = await import("../lib/auth");
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new HttpError(401, "Authentication required");
    }

    res.json({ token, user: publicUser(user) });
  });

export const verifyEmail = () =>
  asyncHandler(async (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : undefined;

    if (!token) {
      throw new HttpError(400, "Verification token is required");
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new HttpError(400, "Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    if (redirect) {
      return res.redirect(`${redirect.replace(/\/$/, "")}/login?verified=1`);
    }

    res.json({ message: "Email verified successfully" });
  });

export const resendVerification = () =>
  asyncHandler(async (req, res) => {
    const data = resendSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (user.emailVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendVerificationEmail(user.email, emailVerificationToken);

    res.json({ message: "Verification email resent" });
  });

export const googleStart = () =>
  asyncHandler(async (req, res) => {
    const client = getGoogleClient();
    if (!client) {
      throw new HttpError(503, "Google auth is not configured");
    }

    const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "/login";
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "consent",
      state: Buffer.from(JSON.stringify({ returnTo })).toString("base64url"),
    });

    res.redirect(authUrl);
  });

export const googleCallback = () =>
  asyncHandler(async (req, res) => {
    const client = getGoogleClient();
    if (!client) {
      throw new HttpError(503, "Google auth is not configured");
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    const decodedState = state ? JSON.parse(Buffer.from(state, "base64url").toString("utf8")) : {};
    const returnTo = typeof decodedState.returnTo === "string" ? decodedState.returnTo : "/login";

    if (!code) {
      throw new HttpError(400, "Authorization code is required");
    }

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      throw new HttpError(400, "Google did not return an identity token");
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new HttpError(400, "Google profile did not include an email address");
    }

    const user = await prisma.user.upsert({
      where: { email: payload.email },
      create: {
        email: payload.email,
        name: payload.name ?? payload.given_name ?? payload.email.split("@")[0],
        avatarUrl: payload.picture,
        googleId: payload.sub,
        authProvider: "GOOGLE",
        emailVerified: true,
        role: "STUDENT",
      },
      update: {
        name: payload.name ?? payload.given_name ?? payload.email.split("@")[0],
        avatarUrl: payload.picture,
        googleId: payload.sub,
        authProvider: "GOOGLE",
        emailVerified: true,
      },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
    const target = `${frontendUrl.replace(/\/$/, "")}${returnTo.startsWith("/") ? returnTo : `/${returnTo}`}`;

    res.redirect(`${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`);
  });
