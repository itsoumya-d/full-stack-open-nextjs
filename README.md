# Full Stack Open: Next.js (University of Helsinki) — Complete Solution

This repository contains the complete, verified solution for all **24 exercises** across all **4 chapters** of the [Full Stack Open: Next.js](https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-nextjs) course by the University of Helsinki.

Built and structured following the **AI Web Development Skills for Agents** framework ([Kimi Resources](https://www.kimi.ai/resources/web-development-skills-for-agents)).

---

## 🛠️ AI Web Development Skills Applied

In accordance with the agentic web development methodology:

1. **`landing-page-scaffold` & MDX Integration**:
   - Structured hero, highlights, and call-to-action landing page rendered natively via `@next/mdx` (`app/page.mdx`).
2. **`design-system-builder`**:
   - Consistent, accessible UI components built with Tailwind CSS, unified design tokens, and modular form layouts (`app/components/`).
3. **`test-driven-dev`**:
   - End-to-end validation with Playwright covering all authentication flows, navigation, blog management, reading lists, and API token regeneration (`tests/blog-app.spec.ts`).
4. **`route-to-openapi` & REST Architecture**:
   - Secured REST endpoints with Bearer token authentication (`/api/me`) and isolated testing reset/seed endpoints (`/api/testing/*`).
5. **`code-vuln-audit` & Security**:
   - Password hashing with Bcrypt (salt rounds 10), SQL injection prevention via Drizzle ORM parameterized queries, route guards, and CSRF protection via Auth.js (NextAuth v5).
6. **`pipeline-blueprint`**:
   - Automated CI workflow via GitHub Actions (`.github/workflows/playwright.yml`) executing database migrations and Playwright test suites.

---

## 📚 Curriculum & Exercise Breakdown

### Chapter 1: Getting Started
- **Exercise 1 (Blog List)**:
  - Initialized Next.js project with App Router.
  - Implemented `/blogs` route displaying blog cards with title, author, and likes.
  - *File*: `app/blogs/page.tsx`
- **Exercise 2 (Navigation & Detail View)**:
  - Added global navigation header in `app/layout.tsx`.
  - Created dynamic route `/blogs/[id]` showing detailed information for a specific blog post.
  - *Files*: `app/layout.tsx`, `app/blogs/[id]/page.tsx`

### Chapter 2: From Single Page Apps to Server-Side Rendering
- **Exercise 3 (Create Blog Server Action)**:
  - Implemented `/blogs/new` page and Server Action `createBlog` to handle form submissions without client-side API boilerplate.
  - *Files*: `app/blogs/new/page.tsx`, `app/actions/blogs.ts`
- **Exercise 4 (Liking Blogs & Cache Revalidation)**:
  - Implemented Server Action `likeBlog` with `revalidatePath` to trigger instant cache updates.
  - *Files*: `app/actions/blogs.ts`, `app/blogs/[id]/page.tsx`
- **Exercise 5 (Sorting Blogs)**:
  - Blogs ordered in descending order by likes (`orderBy(desc(blogs.likes))`).
  - *Files*: `app/services/blogs.ts`, `app/blogs/page.tsx`
- **Exercise 6 (Filtering & Search)**:
  - Added query param filtering (`/blogs?filter=...`) to filter blog posts by title using case-insensitive search (`ilike`).
  - *Files*: `app/blogs/page.tsx`, `app/services/blogs.ts`
- **Exercise 7 (Loading States & Suspense)**:
  - Added React Suspense boundaries and loading skeleton states.
  - *File*: `app/blogs/loading.tsx`

### Chapter 3: Databases, Migrations, and Relations
- **Exercise 8 (Database Setup & Drizzle ORM)**:
  - Configured Drizzle ORM with Neon Serverless Postgres (`drizzle-orm/neon-http`).
  - Defined `blogs` table schema and ran initial migrations (`drizzle-kit`).
  - *Files*: `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`, `drizzle/`
- **Exercise 9 (Users Table & Listing)**:
  - Added `users` table schema (`id`, `username`, `name`, `password_hash`, `token`).
  - Implemented `/users` page listing all registered users.
  - *Files*: `db/schema.ts`, `app/users/page.tsx`, `app/services/users.ts`
- **Exercise 10 (Relational Data — User Detail)**:
  - Configured Drizzle relations between users and blogs (`one-to-many`).
  - Implemented `/users/[username]` route rendering user profile alongside all blogs authored by that user.
  - *Files*: `db/schema.ts`, `app/users/[username]/page.tsx`, `app/services/users.ts`

### Chapter 4: Authentication and More
- **Exercise 11 (User Registration)**:
  - Implemented `/register` page with Zod schema validation (minimum lengths, password confirmation match).
  - Bcrypt password hashing before saving to database.
  - *Files*: `app/register/page.tsx`, `app/components/register-form.tsx`, `app/actions/auth.ts`, `app/lib/definitions.ts`
- **Exercise 12 (NextAuth / Auth.js Configuration)**:
  - Set up Auth.js v5 credentials provider with JWT session strategy.
  - Secure credential verification against stored password hash.
  - *Files*: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `next-auth.d.ts`
- **Exercise 13 (Login Page & Session Handling)**:
  - Implemented `/login` route with interactive state and error feedback.
  - *Files*: `app/login/page.tsx`, `app/components/login-form.tsx`, `app/actions/auth.ts`
- **Exercise 14 (Route & Action Protection)**:
  - Server-side verification of authenticated session before permitting blog creation.
  - *File*: `app/actions/blogs.ts`
- **Exercise 15 (User-Blog Association)**:
  - Added `userId` foreign key constraint linking created blogs directly to the authenticated author.
  - *Files*: `db/schema.ts`, `app/actions/blogs.ts`, `app/services/blogs.ts`
- **Exercise 16 (Dynamic Navigation Bar)**:
  - Conditional navigation display based on session state (login/register links when unauthenticated; user name, 'new blog', 'me', and logout button when authenticated).
  - *File*: `app/components/navbar.tsx`
- **Exercise 17 (Feedback & Notification System)**:
  - Built unified notification context and URL-search-param notification listener for toast feedback across redirects.
  - *Files*: `app/components/notification.tsx`, `app/components/notification-context.tsx`, `app/components/notification-from-search-params.tsx`
- **Exercise 18 (Reading List Schema)**:
  - Created `reading_list` join table (`userId`, `blogId`, `read`) with unique constraint.
  - *File*: `db/schema.ts`
- **Exercise 19 (Personal 'Me' Page)**:
  - Implemented `/me` route showing profile, reading list partitioned into unread and read sections.
  - *Files*: `app/me/page.tsx`, `app/services/users.ts`
- **Exercise 20 (Mark as Read Server Action)**:
  - Implemented action allowing users to mark reading list entries as read with instant revalidation.
  - *Files*: `app/actions/reading-list.ts`, `app/services/reading-list.ts`, `app/me/page.tsx`
- **Exercise 21 (API Token Management)**:
  - Implemented API token generation and regeneration from the `/me` dashboard with optimistic UI updates.
  - *Files*: `app/actions/token.ts`, `app/components/api-token-section.tsx`
- **Exercise 22 (REST API & Testing Endpoints)**:
  - Created `/api/me` protected endpoint authenticating via `Authorization: Bearer <token>`.
  - Created test support routes: `DELETE /api/testing/reset` and `POST /api/testing/users`.
  - *Files*: `app/api/me/route.ts`, `app/api/testing/reset/route.ts`, `app/api/testing/users/route.ts`
- **Exercise 23 (MDX Homepage)**:
  - Configured `@next/mdx` and created `app/page.mdx` with markdown content and custom styling.
  - *Files*: `next.config.ts`, `mdx-components.tsx`, `app/page.mdx`
- **Exercise 24 (Comprehensive Playwright End-to-End Tests)**:
  - Comprehensive Playwright test suite covering all authentication flows, navigation, blog creation, filtering, likes, reading list, and token regeneration.
  - *Files*: `playwright.config.ts`, `tests/blog-app.spec.ts`, `tests/helpers.ts`

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- Node.js 20+ or 22+
- PostgreSQL database (e.g. free tier on [Neon](https://neon.tech), Supabase, or local Docker)

### 2. Environment Variables
Create a `.env.local` file:
```env
DATABASE_URL="postgresql://username:password@ep-sample.neon.tech/neondb?sslmode=require"
AUTH_SECRET="super-secret-random-key-at-least-32-chars-long"
```

For test execution, create a `.env.test` file pointing to a separate test database or schema.

### 3. Install Dependencies
```bash
npm install
```

### 4. Push Database Schema
```bash
npx drizzle-kit push
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Playwright E2E Tests
```bash
npm run test:e2e
```

---

## 📤 Submitting to MOOC.fi

1. Create a repository on your GitHub account.
2. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. Visit [courses.mooc.fi Full Stack Open Next.js](https://courses.mooc.fi/org/uh-cs/courses/full-stack-open-nextjs) and submit your repository link.
