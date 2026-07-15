import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export type JwtUserPayload = {
  sub: string;
  email: string;
  role: "STUDENT" | "ADMIN";
};

const jwtSecret = process.env.JWT_SECRET ?? "dev-jwt-secret";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: JwtUserPayload) {
  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, jwtSecret) as JwtUserPayload;
}
