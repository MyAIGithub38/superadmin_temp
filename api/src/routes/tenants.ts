import { Router } from "express";
import { z } from "zod";
import { query } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

export const router = Router();
router.use(requireAuth, requireRole(["superadmin"]));

router.get("/", async (_req, res) => {
  const { rows } = await query<any>(`SELECT id, name, created_at AS "createdAt" FROM tenants ORDER BY id DESC`);
  return res.json(rows);
});

router.post("/", async (req, res) => {
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  const { rows } = await query<any>(`INSERT INTO tenants (name) VALUES ($1) RETURNING id, name, created_at AS "createdAt"`, [parsed.data.name]);
  return res.json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const schema = z.object({ name: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payload" });
  await query(`UPDATE tenants SET name=$1 WHERE id=$2`, [parsed.data.name, id]);
  return res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await query(`DELETE FROM tenants WHERE id=$1`, [id]);
  return res.json({ success: true });
});

export default router;

