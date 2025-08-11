# Project Analysis

This document provides an analysis of the `superadmin_temp` project.

## Overview

The project is a monorepo containing a backend API and a frontend web application. It is a multi-tenant, role-based access control (RBAC) system for managing users and applications.

## Backend API (`api` directory)

*   **Technology:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL
*   **Authentication:** JWT
*   **Key Dependencies:** `bcryptjs`, `cors`, `dotenv`, `express`, `express-rate-limit`, `helmet`, `jsonwebtoken`, `multer`, `pg`, `uuid`, `zod`

### Running the API

1.  Navigate to the `api` directory.
2.  Create a `.env` file with a `DATABASE_URL` variable (e.g., `DATABASE_URL=postgresql://user:password@host:port/database`).
3.  Run `npm install`.
4.  Run `npm run dev`.

The API will likely be available at `http://localhost:4000`.

## Frontend Web Application (`web` directory)

*   **Technology:** Next.js, React, TypeScript, Tailwind CSS
*   **API Communication:** `axios`
*   **Authentication:** JWT stored in `localStorage`.

### Running the Web App

1.  Navigate to the `web` directory.
2.  Create a `.env.local` file with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.
3.  Run `npm install`.
4.  Run `npm run dev`.

The web application will be available at `http://localhost:3000`.

## Database Schema

The schema is in `schema.sql` and includes tables for `tenants`, `users`, `applications`, `user_applications`, and `refresh_tokens`.
