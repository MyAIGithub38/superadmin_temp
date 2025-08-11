import "dotenv/config";
import express, { json, urlencoded } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { router as authRouter } from "./routes/auth";
import { router as usersRouter } from "./routes/users";
import { router as appsRouter } from "./routes/apps";
import { router as tenantsRouter } from "./routes/tenants";
import { router as avatarRouter } from "./routes/profile-avatar";
import path from "node:path";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(json({ limit: "1mb" }));
app.use(urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ service: "RBAC API", status: "ok" }));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/apps", appsRouter);
app.use("/tenants", tenantsRouter);
app.use("/users", avatarRouter);

// serve uploaded files statically
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// basic error handler to ensure JSON responses
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || "Internal server error";
  res.status(status).json({ message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}`);
});

