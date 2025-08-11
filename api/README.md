Setup

1) Create .env file (copy from below):

PORT=4000
DATABASE_URL=postgres://username:password@localhost:5432/mydb
PGSSL=false
JWT_SECRET=change_me

2) Create database and run schema.sql in project root:

psql "$DATABASE_URL" -f ../schema.sql

3) Install and run:

npm install
npm run dev

Endpoints (partial)
- POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- GET /users/me, PUT /users/me
- GET /users?scope=all|mine, POST /users, PUT /users/:id, DELETE /users/:id
- GET /apps?scope=mine|managed|all, POST /apps, PUT /apps/:id, DELETE /apps/:id, POST /apps/:id/assign
- GET /tenants, POST /tenants, PUT /tenants/:id, DELETE /tenants/:id

Security
- Helmet, CORS, rate limiters, JWT access tokens + refresh token rotation, RBAC checks per route and tenant isolation.

