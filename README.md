# SuperAdmin Project

This project is a full-stack application designed for managing users, tenants, and applications with a robust role-based access control system. It is structured as a monorepo, separating the backend API from the frontend web application.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Backend (API)

-   **Authentication & Authorization**: Secure user registration, login, password reset, and JWT-based authentication with refresh token support. Implements role-based access control (Superadmin, Admin, User).
-   **User Management**: Comprehensive CRUD (Create, Read, Update, Delete) operations for user accounts, including profile management and avatar uploads.
-   **Admin Management**: Dedicated functionalities for administrators to manage users under their specific purview.
-   **Tenant Management**: Full CRUD operations for tenants, enabling a multi-tenancy architecture.
-   **Application Management**: CRUD operations for applications, including the ability to assign applications to users.
-   **Error Handling**: Centralized and normalized error handling for consistent API responses.

### Frontend (Web)

-   **Authentication Flow**: Intuitive and dedicated pages for user login, registration, and password recovery.
-   **Role-Based Dashboards**:
    -   **User Dashboard**: A general dashboard tailored for regular users.
    -   **Admin Dashboard**: A specialized dashboard for administrators, providing tools to manage users and applications relevant to their assigned tenants.
    -   ****Superadmin Dashboard**: A powerful, comprehensive dashboard for superadmins with full control over all users, tenants, and applications across the system.
-   **User Profile & Settings**: Pages allowing users to manage their personal profile information and application settings.
-   **Responsive UI**: A modern and responsive user interface built with Tailwind CSS, ensuring optimal viewing across various devices.
-   **Form Management**: Utilizes React Hook Form and Zod for efficient, robust, and validated form handling.

## Technologies Used

### Backend

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
-   **TypeScript**: Superset of JavaScript that adds static types.
-   **PostgreSQL**: Powerful, open-source object-relational database system.
-   **bcryptjs**: Library for hashing passwords.
-   **jsonwebtoken**: For implementing JSON Web Tokens for secure authentication.
-   **multer**: Middleware for handling `multipart/form-data`, primarily used for file uploads.
-   **zod**: TypeScript-first schema declaration and validation library.
-   **cors**: Provides a Connect/Express middleware that can be used to enable CORS with various options.
-   **dotenv**: Loads environment variables from a `.env` file.
-   **helmet**: Helps secure Express apps by setting various HTTP headers.
-   **express-rate-limit**: Basic rate-limiting middleware for Express.

### Frontend

-   **Next.js**: React framework for building production-ready applications.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: For type-safe frontend development.
-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
-   **react-hook-form**: Performant, flexible and extensible forms with easy-to-use validation.
-   **zod**: For schema validation, integrated with `react-hook-form`.
-   **axios**: Promise-based HTTP client for the browser and Node.js.

## Project Structure

```
superadmin_temp/
├── api/             # Backend API (Node.js, Express.js, TypeScript)
│   ├── src/         # Source code for the API
│   │   ├── db.ts    # Database connection and setup
│   │   ├── index.ts # Main entry point for the API
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/    # API route definitions (admins, apps, auth, profile-avatar, tenants, users)
│   │   └── utils/     # Utility functions (e.g., JWT handling)
│   └── package.json   # Backend dependencies and scripts
├── web/             # Frontend Web Application (Next.js, React, TypeScript)
│   ├── public/      # Static assets
│   ├── src/         # Source code for the web app
│   │   ├── app/       # Next.js App Router pages
│   │   │   ├── (auth)/      # Authentication pages (login, register, forgot-password)
│   │   │   ├── (dashboard)/ # Main application dashboards (admin, applications, dashboard, settings, superadmin, user)
│   │   │   └── layout.tsx   # Root layout for the app
│   │   ├── components/ # Reusable React components (auth, cards, layout, lists, ui)
│   │   ├── context/    # React context providers (e.g., AuthContext)
│   │   └── lib/        # Frontend utility functions and API client
│   └── package.json   # Frontend dependencies and scripts
└── README.md        # This README file
```

## Getting Started

To get this project up and running on your local machine, follow these steps:

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (Node Package Manager)
-   PostgreSQL database server

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd superadmin_temp
    ```

2.  **Backend Setup:**

    Navigate to the `api` directory and install dependencies:

    ```bash
    cd api
    npm install
    ```

    Create a `.env` file in the `api` directory based on `.env.example` (you might need to create `.env.example` first if it doesn't exist, or infer variables from `src/db.ts` and `src/index.ts`). Essential variables will include database connection details and JWT secrets.

    Example `.env` for `api`:
    ```env
    PORT=4000
    DATABASE_URL="postgresql://user:password@localhost:5432/superadmin_db"
    JWT_SECRET="your_jwt_secret_key"
    REFRESH_TOKEN_SECRET="your_refresh_token_secret_key"
    ```

    Initialize your PostgreSQL database and run migrations (if any, check `api/src/db.ts` or `schema.sql` for schema definition). You might need a tool like `psql` or a GUI client to create the database and run the `schema.sql` file.

    ```bash
    # Example: Create database and run schema.sql
    # psql -U your_user -c "CREATE DATABASE superadmin_db;"
    # psql -U your_user -d superadmin_db -f schema.sql
    ```

3.  **Frontend Setup:**

    Navigate to the `web` directory and install dependencies:

    ```bash
    cd ../web
    npm install
    ```

    Create a `.env.local` file in the `web` directory. This will typically contain the API base URL.

    Example `.env.local` for `web`:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
    ```

### Running the Application

1.  **Start the Backend API:**

    From the `api` directory:

    ```bash
    npm run dev
    # Or for production build:
    # npm run build
    # npm start
    ```

    The API should start on `http://localhost:4000` (or your specified PORT).

2.  **Start the Frontend Web Application:**

    From the `web` directory:

    ```bash
    npm run dev
    # Or for production build:
    # npm run build
    # npm start
    ```

    The frontend application should open in your browser at `http://localhost:3000` (or another port if 3000 is in use).

## API Documentation

(To be added: Details on API endpoints, request/response formats, and authentication. This would typically be generated using tools like Swagger/OpenAPI or manually documented.)

## Contributing

(To be added: Guidelines for contributing to the project.)

## License

(To be added: Project license information.)
