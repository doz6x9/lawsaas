# LegalAct SaaS Platform

LegalAct is a comprehensive LegalTech Software-as-a-Service platform designed to streamline and automate legal workflows for boutique law firms, with a specific focus on compliance with European (EU/EEA) and Hungarian (NAIH) regulations. Built with a modern React/Node.js/TypeScript stack and powered by Supabase, it offers a suite of tools to enhance efficiency, reduce manual tasks, and ensure data privacy.

## Features

### 1. Zero-Touch Client Intake & Document Generation
- **Public-Facing Intake Form:** A professional, secure web form (`/intake`) for clients to submit new case details and evidence links.
- **Automated Document Assembly:** Automatically generates official Word (.docx) demand letters based on client submissions.
- **Supabase Integration:** Seamlessly saves relational client data (Contacts, Cases, Images) to your Supabase PostgreSQL database.
- **Secure Storage:** Uploads generated documents to a dedicated Supabase Storage bucket.

### 2. Batch Document Processing
- **Excel Upload:** Allows law firm staff to upload multi-sheet Excel files containing client, case, and image data.
- **Dynamic Output:** Generates both an aggregated Excel file (joining all relational data) and individual Word documents for each case.
- **Selective Download:** Provides a UI to view all generated files, select specific ones, and download them individually or as a combined ZIP archive.
- **Database Import Toggle:** Option to automatically import/update parsed client and case data into the Supabase database.

### 3. Smart Document Redaction
- **Automated PII Redaction:** Before downloading, users can apply redaction rules to automatically black out sensitive information like phone numbers and email addresses from generated Word documents.
- **Custom Redaction:** Users can define custom words or phrases to be redacted.
- **DOCX Upload Redaction:** The automated redaction tool accepts `.docx` files, sends them to the backend, and returns redacted Word documents for download.

### 4. Contacts / Infringer Directory
- **Master List:** A dedicated dashboard page (`/contacts`) to view a master list of all stored contacts (infringers).
- **Aggregated Client Names:** Displays a comma-separated list of all client names associated with each contact.
- **Search & Filter:** Includes a search bar to filter contacts by company name, infringer ID, or client names.
- **CSV Export:** Export the filtered contact list to a GDPR-compliant CSV file (with UTF-8 BOM for Hungarian characters).

### 5. Conflict of Interest Search
- **Full-Text Search:** A powerful search tool (`/conflict`) to scan across all recorded cases, client names, company names, and phone numbers.
- **Malpractice Prevention:** Helps identify potential conflicts of interest with fuzzy matching.
- **Structured Results:** Returns a clear report detailing which Case IDs the search term appeared in and the type of match (e.g., "Client Name", "Infringer Company").

### 6. Határidő-számító (Procedural Deadline Calculator)
- **Hungarian Law Compliance:** Calculates exact procedural deadlines based on Hungarian Civil Procedure Code (Pp.) rules.
- **Working Days Logic:** Automatically skips weekends and dynamically fetched Hungarian national holidays.
- **Intuitive UI:** Provides a clean interface to input a start date and duration, displaying the final deadline in a clear, localized format.

### 7. Automated Tools Library
- **Configurable Automations:** A dashboard section (`/home`) to view and configure pre-built legal automation workflows.
- **Dynamic Setup:** Each tool (e.g., Demand Letter Generator, Court Deadline Alert, Invoice Reminder) has a dynamic setup screen to customize its behavior.
- **Backend Execution:** These automations are designed to run in the background, performing tasks like generating documents, sending alerts, or processing data based on their configuration.

### 8. GDPR-Compliant Data Retention
- **Automated Scrubbing:** A nightly cron job automatically identifies and processes `Case` records older than 30 days.
- **Evidence Deletion:** Permanently deletes associated raw evidence images from Supabase Storage.
- **PII Masking:** Nullifies or masks sensitive 'Phone' and 'Company' data in the 'Contacts' table.
- **Audit Trail:** Updates an `isScrubbed` flag to maintain a record of data deletion.

## Tech Stack

-   **Frontend:** React, TypeScript, Tailwind CSS (Microsoft Fluent Design System), `react-i18next`, `framer-motion`, `JSZip`.
-   **Backend:** Node.js, Express.js, TypeScript, `axios`, `docxtemplater`, `pizzip`, `convertapi`, `fs-extra`, `node-cron`, `multer`, `uuid`.
-   **Database:** Supabase (PostgreSQL & Storage).

## Setup & Running the Application

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- A Supabase project (URL and Service Role Key required)
- A ConvertAPI Secret (required only for DOCX to PDF conversion)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```
PORT=3000
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
# ConvertAPI Secret for PDF conversion
CONVERTAPI_SECRET=YOUR_CONVERTAPI_SECRET
```
Apply the schema from `backend/supabase_schema.sql` to your Supabase project.
Create a folder `backend/storage/templates` and place your base `.docx` template files there (e.g., `EuLatePaymentDemand.docx`).

To run the backend:
```bash
npm run dev
```
The backend runs at `http://localhost:3000`. You can verify it with:
```bash
curl http://localhost:3000/api/health
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Optionally create `frontend/.env` for Supabase-backed browser features:
```
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

To run the frontend:
```bash
npm run dev
```
Access the application in your browser at the Vite URL printed in the terminal, usually `http://localhost:5173`. If that port is already in use, Vite may use `http://localhost:5174`.

### 3. PDF Conversion
PDF generation uses ConvertAPI. For local development, put your ConvertAPI secret in `backend/.env`:
```
CONVERTAPI_SECRET=YOUR_CONVERTAPI_SECRET
```
Restart the backend after changing `.env`. DOCX generation and DOCX redaction do not require ConvertAPI.

### 4. Automated Redaction
The dashboard's Automated Document Redaction tool calls:
- `POST /api/redact-document` for single-file redaction from the preview flow.
- `POST /api/redact-documents` for multi-file ZIP redaction.

If the UI shows `Failed to fetch`, make sure the backend is running and reachable:
```bash
cd backend
npm run dev
```
Then check `http://localhost:3000/api/health`.

### Key Routes:
- `/`: Landing Page
- `/intake`: Public Client Intake Form
- `/services`: Public Services/Pricing Page
- `/privacy`: Privacy Policy
- `/terms`: Terms of Service
- `/contact`: Contact Us
- `/dashboard`: Internal Dashboard (accessible via login from Landing Page)

## Deployment

### Vercel Deployment
1. **Connect your GitHub repository** to Vercel.
2. **Set the Root Directory** to the repository root, not `frontend` or `backend`.
3. The root `vercel.json` deploys both `backend/src/api/index.ts` and the `frontend` static build.
4. Add the production environment variables from `backend/.env.example` and `frontend/.env.example`.

The current Vercel output places frontend static assets under `/frontend`, so the root `vercel.json` keeps explicit routes for `/api`, `/frontend/*`, and the SPA fallback.

### Build Checks
GitHub Actions runs two checks on pushes and pull requests:
- `frontend`: `npm ci` and `npm run build`
- `backend`: `npm ci` and `npx tsc --noEmit`

### Backend Deployment (Persistent Server - e.g., Render, Railway)
**Important:** Your backend uses `node-cron` for scheduled tasks (GDPR scrubbing, deadline alerts). Vercel Serverless Functions are NOT suitable for these long-running background jobs. Deploy your backend to a persistent server.
1.  Connect your GitHub repository to your chosen provider (Render, Railway, etc.).
2.  Set the Root Directory to `backend`.
3.  Configure build and start commands (`npm install`, `npm start`).
4.  **Crucially, configure all environment variables** (Supabase keys, `CONVERTAPI_SECRET`) in your hosting provider's settings.
5.  Update your frontend's API calls to point to your live backend URL.

---
