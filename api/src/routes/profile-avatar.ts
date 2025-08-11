import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { upload, uploadsPublicPath } from "../upload";
import path from "node:path";
import { query } from "../db";

export const router = Router();
router.use(requireAuth);

router.post("/me/avatar", upload.single("file"), async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file" });
  const urlPath = path.posix.join(uploadsPublicPath, path.basename(file.path));
  await query(`UPDATE users SET avatar_url=$1 WHERE id=$2`, [urlPath, req.user!.id]);
  return res.json({ avatarUrl: urlPath });
});

export default router;

