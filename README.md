# CV Architect Pro - AI-Powered Resume Builder

CV Architect Pro is a production-grade career engine that leverages Google's Gemini AI to help users build, tailor, and optimize their resumes for modern Applicant Tracking Systems (ATS).

## 🚀 Features

- **AI-Powered Parsing:** Instantly convert raw text or existing resumes into structured, professional data.
- **Job Description Tailoring:** Automatically re-rank and highlight skills to match specific job requirements.
- **ATS Optimization:** Built-in guidance and formatting designed to pass through automated screening.
- **Secure Authentication:** Integrated with Auth0 for robust user profile and data management.
- **Persistent Storage:** Optional Cloudflare D1 integration for saving and managing multiple resume versions.
- **Multi-format Export:** High-quality downloads in PDF, DOCX, and JSON formats.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Engine:** [Google Gemini 3 Flash](https://aistudio.google.com/)
- **Authentication:** [Auth0](https://auth0.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [Motion](https://motion.dev/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Validation:** [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📋 Prerequisites

- **Node.js 20+**
- **npm** or **pnpm**
- **Auth0 Account** (Free tier works)
- **Google AI Studio API Key** (Gemini)
- **Cloudflare Account** (Optional, for D1 database)

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/faheemahmed24/CV.git
   cd CV
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize Database (Optional):**
   If using Cloudflare D1 locally:
   ```bash
   npx wrangler d1 execute <your-db-name> --local --file=schema.sql
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GEMINI_API_KEY` | Google Gemini API Key | [AI Studio](https://aistudio.google.com/app/apikey) |
| `AUTH0_SECRET` | Random 32-char string | Generate with `openssl rand -hex 32` |
| `AUTH0_BASE_URL` | App Base URL | `http://localhost:3000` (local) |
| `AUTH0_ISSUER_BASE_URL` | Auth0 Domain | Auth0 Dashboard (Settings) |
| `AUTH0_CLIENT_ID` | Auth0 Client ID | Auth0 Dashboard (Settings) |
| `AUTH0_CLIENT_SECRET` | Auth0 Client Secret | Auth0 Dashboard (Settings) |

## 🚢 Deployment

### GitHub Actions
The project includes a `.github/workflows/deploy.yml` for automated CI/CD. Ensure you add the environment variables listed above as **GitHub Secrets**.

### Cloudflare Pages
1. Connect your GitHub repo to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `.next`.
4. Add all environment variables in the Cloudflare Dashboard.
5. Bind your D1 database to the `DB` variable.

## ❓ Troubleshooting

- **"undefined" is not valid JSON:** This usually happens when a console log argument is undefined in the AI Studio environment. We've added a global patch to handle this.
- **Auth0 Login Errors:** Ensure your `AUTH0_BASE_URL` matches the "Allowed Callback URLs" in your Auth0 application settings.
- **Gemini API Key Missing:** Check your `.env.local` or platform environment variables.

## 🛡️ Security

- **CSP Headers:** Configured in `next.config.ts`.
- **Environment Validation:** Runtime checks ensure all required keys are present.
- **Auth0 Middleware:** Protects sensitive API routes.
