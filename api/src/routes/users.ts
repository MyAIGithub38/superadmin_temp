import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../db";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export const router = Router();

router.use(requireAuth);

router.get("/me", async (req: AuthRequest, res) => {
  const id = Number(req.user!.id);
  const { rows } = await query<any>(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, phone, address, avatar_url AS "avatarUrl", tenant_id AS "tenantId" FROM users WHERE id=$1`, [id]);
  return res.json(rows[0]);
});

router.put("/me", async (req: AuthRequest, res) => {
  const schema = z.object({ firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), address: z.string().optional(), vcb: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const id = Number(req.user!.id);
  const { firstName, lastName, email, phone, address } = parsed.data;
  await query(`UPDATE users SET first_name=COALESCE($1, first_name), last_name=COALESCE($2, last_name), email=COALESCE($3, email), phone=COALESCE($4, phone), address=COALESCE($5, address) WHERE id=$6`, [firstName ?? null, lastName ?? null, email ?? null, phone ?? null, address ?? null, id]);
  const { rows } = await query<any>(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, phone, address, avatar_url AS "avatarUrl", tenant_id AS "tenantId" FROM users WHERE id=$1`, [id]);
  return res.json(rows[0]);
});

router.get("/", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const scope = (req.query.scope as string) ?? "all";
  if (req.user!.role === "superadmin" && scope === "all") {
    const { rows } = await query<any>(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, phone, address, avatar_url AS "avatarUrl", tenant_id AS "tenantId", created_by_admin_id AS "createdByAdminId" FROM users ORDER BY id DESC`);
    return res.json(rows);
  }
  // admin: allow "mine" scope only
  if (req.user!.role === "admin" && scope !== "mine") return res.status(403).json({ message: "Forbidden" });
  const tenantId = req.user!.tenantId;
  const { rows } = await query<any>(`SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, phone, address, avatar_url AS "avatarUrl", tenant_id AS "tenantId", created_by_admin_id AS "createdByAdminId" FROM users WHERE tenant_id=$1 ORDER BY id DESC`, [tenantId]);
  return res.json(rows);
});

router.post("/", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const schema = z.object({ firstName: z.string(), lastName: z.string(), email: z.string().email(), password: z.string().min(6).optional(), role: z.enum(["user", "admin", "superadmin"]).optional().default("user"), tenantId: z.string().optional(), assignedAdminId: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const { firstName, lastName, email, role, password, tenantId, assignedAdminId } = parsed.data;
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  
  let finalTenantId = null;
  if (req.user!.role === "admin") {
    finalTenantId = req.user!.tenantId;
  }

  if (req.user!.role === "superadmin") {
    if (tenantId) {
      finalTenantId = Number(tenantId);
    } else if (assignedAdminId) {
      const { rows } = await query<any>(`SELECT tenant_id FROM users WHERE id=$1`, [assignedAdminId]);
      if (rows.length > 0) {
        finalTenantId = rows[0].tenant_id;
      }
    }
  }

  let finalCreatedByAdminId = req.user!.id;
  if (req.user!.role === "superadmin" && assignedAdminId) {
    finalCreatedByAdminId = Number(assignedAdminId);
  }

  const { rows } = await query<any>(`INSERT INTO users (first_name,last_name,email,password_hash,role,tenant_id,created_by_admin_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, [firstName, lastName, email, passwordHash, role, finalTenantId, finalCreatedByAdminId]);
  return res.json({ id: rows[0].id, firstName, lastName, email, role, tenantId: finalTenantId });
});

router.put("/:id", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const schema = z.object({ firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().email().optional(), role: z.enum(["user", "admin", "superadmin"]).optional(), phone: z.string().optional(), address: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  // tenant isolation for admin
  if (req.user!.role === "admin") {
    const check = await query(`SELECT 1 FROM users WHERE id=$1 AND tenant_id=$2`, [id, req.user!.tenantId]);
    if (check.rows.length === 0) return res.status(403).json({ message: "Forbidden" });
  }
  await query(`UPDATE users SET first_name=COALESCE($1, first_name), last_name=COALESCE($2, last_name), email=COALESCE($3, email), role=COALESCE($4, role), phone=COALESCE($5, phone), address=COALESCE($6, address) WHERE id=$7`, [parsed.data.firstName ?? null, parsed.data.lastName ?? null, parsed.data.email ?? null, parsed.data.role ?? null, parsed.data.phone ?? null, parsed.data.address ?? null, id]);
  return res.json({ success: true });
});

router.delete("/:id", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (req.user!.role === "admin") {
    const check = await query(`SELECT 1 FROM users WHERE id=$1 AND tenant_id=$2`, [id, req.user!.tenantId]);
    if (check.rows.length === 0) return res.status(403).json({ message: "Forbidden" });
  }
  await query(`DELETE FROM users WHERE id=$1`, [id]);
  return res.json({ success: true });
});

export default router;

