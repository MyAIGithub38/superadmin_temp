import jwt from "jsonwebtoken";

export interface JwtPayloadBase {
  sub: string; // user id
  role: "superadmin" | "admin" | "user";
  tenantId?: number | string | null;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "change_me";

export function signAccessToken(payload: JwtPayloadBase, expiresIn: string = "15m"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyAccessToken<T extends object = JwtPayloadBase>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

