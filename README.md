# Crop Analytics

Crop Analytics (exported from Google AI Studio) is a React + TypeScript single-page app for crop and transaction analysis with multilingual support and AI-assisted insights aimed at farmers and agronomists.

Features
- Multi-language support via a LanguageContext.
- Visual dashboards and charts for crop cost/profit, monthly transactions and aggregated views.
- File upload and demo data support.
- AI-driven insights via a gemini service wrapper (services/gemini.ts).
- PWA-ready (manifest.json + sw.js present).

Quick start (recommended)
1. Clone the repo:
   ```bash
   git clone https://github.com/Sasiinhub/crop-analysis.git
   cd crop-analysis
   ```

2. Initialize and install dependencies (example using Vite + npm):
   ```bash
   npm init vite@latest . -- --template react-ts
   npm install
   npm install react react-dom lucide-react
   # Add other libs as required (chart libraries, etc.)
   ```

3. Add environment variables:
   - Create a `.env` file and add the API key(s):
     ```env
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - (Do not commit `.env` to version control.)

4. Run dev server:
   ```bash
   npm run dev
   ```

Missing or recommended repo additions
- package.json, tsconfig.json and appropriate scripts (dev/build/preview) — a minimal package.json and tsconfig.json are included in this commit to help you get started.
- .gitignore to exclude env files, node_modules and build outputs.
- Add any charting or other third-party dependencies required by components.

Notes about AI service
- `services/gemini.ts` is the AI integration; provide the API key via environment variable (Vite uses `VITE_` prefixes for client-side env vars).
- Consider moving sensitive calls to a server-side proxy if you want to hide keys from the client.

License
- The MIT license has been added in `LICENSE`.

Attribution
- The manifest references icons from an external CDN (flaticon). Those assets may require attribution. See `ATTRIBUTION.md` for details.
