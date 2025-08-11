import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { query } from "../db";
import { signAccessToken, verifyAccessToken } from "../utils/jwt";
import crypto from "node:crypto";

export const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.number().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  const { firstName, lastName, email, password, tenantId } = parsed.data;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO users (first_name,last_name,email,password_hash,role,tenant_id) VALUES ($1,$2,$3,$4,'user',$5) RETURNING id`,
      [firstName, lastName, email, hashed, tenantId ?? null]
    );
    const userId = rows[0].id;
    const accessToken = signAccessToken({ sub: String(userId), role: "user", tenantId: tenantId ?? null });
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)`, [userId, refreshToken, expires]);
    return res.json({ token: accessToken, refreshToken });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message ?? "Registration failed" });
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  const { email, password } = parsed.data;
  const { rows } = await query<any>(`SELECT * FROM users WHERE email=$1 LIMIT 1`, [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: String(user.id), role: user.role, tenantId: user.tenant_id });
  // issue refresh token
  const refreshToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await query(`INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)`, [user.id, refreshToken, expires]);
  return res.json({ token: accessToken, refreshToken });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
  try {
    const token = auth.substring("Bearer ".length);
    const payload = verifyAccessToken<any>(token);
    const { rows } = await query<any>(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, phone, address, avatar_url AS "avatarUrl", tenant_id AS "tenantId" FROM users WHERE id=$1`, [payload.sub]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "Not found" });
    return res.json(user);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (!token) return res.status(400).json({ message: "Missing refresh token" });
  const { rows } = await query<any>(`SELECT rt.*, u.role, u.tenant_id FROM refresh_tokens rt JOIN users u ON u.id=rt.user_id WHERE token=$1 AND is_revoked=FALSE LIMIT 1`, [token]);
  const record = rows[0];
  if (!record) return res.status(401).json({ message: "Invalid refresh token" });
  if (new Date(record.expires_at).getTime() < Date.now()) return res.status(401).json({ message: "Refresh token expired" });
  const newAccess = signAccessToken({ sub: String(record.user_id), role: record.role, tenantId: record.tenant_id });
  return res.json({ token: newAccess });
});

router.post("/logout", async (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (!token) return res.json({ success: true });
  await query(`UPDATE refresh_tokens SET is_revoked=TRUE WHERE token=$1`, [token]);
  return res.json({ success: true });
});

export default router;

