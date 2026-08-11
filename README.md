# Orbit CRM

A full-stack CRM built on the MERN stack (MongoDB, Express, React, Node) covering:

- **Leads** — capture, qualify, and convert prospects into customers
- **Customers** — direct accounts, plus ones converted from won leads
- **Distributors** — regional reseller partners
- **OEMs** — original equipment manufacturer accounts/contracts
- **Quotations** — line-item quotes with auto-numbering, tax/discount math, and one-click emailing
- **Follow-ups** — due-today/overdue tracker with call/email/meeting logging
- **Emailing** — quotations and follow-up messages sent via SMTP, with a full send log
- **Secure auth** — JWT access + refresh tokens in httpOnly cookies, bcrypt password hashing, role-based access (admin / manager / sales), rate-limited login

## Project structure

```
crm-project/
  backend/     Express API + MongoDB models
  frontend/    React (Vite) + Tailwind UI
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a MongoDB Atlas connection string
- An SMTP account for sending emails (Gmail with an App Password works well for testing)

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT secrets, and SMTP credentials
npm install
npm run dev          # starts on http://localhost:5000
```

Generate strong values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Creating the first admin account

There's no seed script needed — just call the bootstrap endpoint once (it only works while the `users` collection is empty; after that it requires an existing admin):

```bash
curl -X POST http://localhost:5000/api/auth/register-first-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Admin","email":"jane@yourcompany.com","password":"ChangeMe123!"}'
```

That account becomes `role: admin`. Log in with it from the app, then use **Team & Settings** to add the rest of your team (they don't need shell access).

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev           # starts on http://localhost:5173
```

If your backend runs somewhere other than `http://localhost:5000/api`, create `frontend/.env` with:

```
VITE_API_URL=https://your-api-host/api
```

## 3. Using the app

1. Open `http://localhost:5173/login` and sign in with the admin account you created above.
2. Add team members under **Team & Settings** (admin only).
3. Start logging **Leads**, converting won ones into **Customers**, and tracking **Distributors**/**OEMs**.
4. Build a **Quotation** against a lead or customer, then use the send icon to email it — it uses the SMTP settings from your `.env`.
5. Schedule **Follow-ups** and check the "due today/overdue" panel each morning; mark them done or missed with an outcome note.
6. Every email the app sends (quotations, follow-up notes, ad-hoc messages) is recorded in **Email Log**.

## Security notes for production

- Set `NODE_ENV=production` so cookies are marked `Secure` (HTTPS required).
- Put the API behind HTTPS and update `CLIENT_URL`/CORS accordingly.
- Rotate `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` if they are ever exposed.
- Consider adding 2FA and audit logging if this will hold sensitive customer data.

## Extending it

The backend uses a small CRUD factory (`backend/src/utils/crudFactory.js`) so adding a new module (e.g. "Products" or "Contracts") is mostly: a Mongoose model, a controller built with `buildCrud`, and a routes file — following the pattern of `distributorController.js` / `distributorRoutes.js`.
