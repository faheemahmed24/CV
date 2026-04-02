# CV Architect Pro - AI-Powered Resume Builder

CV Architect Pro is a production-grade Next.js application that helps you build ATS-optimized resumes using the power of Google's Gemini AI.

## 🚀 Features

- **AI Parsing:** Convert raw text or old resumes into structured JSON data.
- **ATS Optimization:** Designed to pass through Applicant Tracking Systems.
- **Auth0 Integration:** Secure user authentication and profile management.
- **Cloudflare D1:** Persistent storage for your resume versions.
- **Multi-format Export:** Download as PDF, DOCX, or JSON.

## 📋 Prerequisites

- **Node.js 20+**
- **npm** or **pnpm**
- **Auth0 Account** (Free tier works)
- **Google AI Studio API Key** (Gemini)
- **Cloudflare Account** (Optional, for D1 database)

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd ai-studio-applet
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
