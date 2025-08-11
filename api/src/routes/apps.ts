import { Router } from "express";
import { z } from "zod";
import { query } from "../db";
import { requireAuth, requireRole, type AuthRequest } from "../middleware/auth";

export const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const scope = (req.query.scope as string) ?? "mine";
  if (req.user!.role === "superadmin" && scope === "all") {
    const { rows } = await query<any>(`SELECT id, tenant_id AS "tenantId", name, description FROM applications ORDER BY id DESC`);
    return res.json(rows);
  }
  if (["admin", "superadmin"].includes(req.user!.role) && scope === "managed") {
    const { rows } = await query<any>(`SELECT id, tenant_id AS "tenantId", name, description FROM applications WHERE tenant_id=$1 ORDER BY id DESC`, [req.user!.tenantId]);
    return res.json(rows);
  }
  // mine (all roles)
  const { rows } = await query<any>(
    `SELECT a.id, a.tenant_id AS "tenantId", a.name, a.description FROM applications a JOIN user_applications ua ON ua.application_id=a.id WHERE ua.user_id=$1 ORDER BY a.id DESC`,
    [req.user!.id]
  );
  return res.json(rows);
});

router.post("/", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const schema = z.object({ name: z.string().min(1), description: z.string().optional(), tenantId: z.union([z.number(), z.string()]).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const { name, description } = parsed.data;
  let tenantId: any = req.user!.tenantId ?? null;
  if (req.user!.role === "superadmin" && parsed.data.tenantId) tenantId = parsed.data.tenantId;
  const { rows } = await query<any>(`INSERT INTO applications (tenant_id,name,description) VALUES ($1,$2,$3) RETURNING id`, [tenantId, name, description ?? null]);
  return res.json({ id: rows[0].id, tenantId, name, description });
});

router.put("/:id", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (req.user!.role === "admin") {
    const ok = await query(`SELECT 1 FROM applications WHERE id=$1 AND tenant_id=$2`, [id, req.user!.tenantId]);
    if (ok.rows.length === 0) return res.status(403).json({ message: "Forbidden" });
  }
  const schema = z.object({ name: z.string().optional(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  await query(`UPDATE applications SET name=COALESCE($1, name), description=COALESCE($2, description) WHERE id=$3`, [parsed.data.name ?? null, parsed.data.description ?? null, id]);
  return res.json({ success: true });
});

router.delete("/:id", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (req.user!.role === "admin") {
    const ok = await query(`SELECT 1 FROM applications WHERE id=$1 AND tenant_id=$2`, [id, req.user!.tenantId]);
    if (ok.rows.length === 0) return res.status(403).json({ message: "Forbidden" });
  }
  await query(`DELETE FROM applications WHERE id=$1`, [id]);
  return res.json({ success: true });
});

router.post("/:id/assign", requireRole(["superadmin", "admin"]), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const email = String((req.body?.email ?? "")).toLowerCase();
  const userRes = await query<any>(`SELECT id, tenant_id FROM users WHERE email=$1`, [email]);
  const user = userRes.rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });
  if (req.user!.role === "admin" && user.tenant_id !== req.user!.tenantId) return res.status(403).json({ message: "Forbidden" });
  await query(`INSERT INTO user_applications (user_id, application_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [user.id, id]);
  return res.json({ success: true });
});

export default router;

