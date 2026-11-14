# Kalma Social Club (KSC) — Project Guide

Website and admin panel for Kalma Social Club, a non-political community
organisation in Kalma, Savar, Dhaka, Bangladesh. Founded 2024.

The person you are working with is a frontend developer (React, Next.js,
4 years) with basic backend knowledge. They want to **understand how things
work**, not just receive working code. When you introduce something they
have not used before — Drizzle migrations, Workers bindings, presigned
uploads — explain the idea in two or three sentences before or after the
code. Do not pad every change with a tutorial; explain the new thing once.

---

## 1. The club

- **Name:** কলমা সোশ্যাল ক্লাব / Kalma Social Club (KSC)
- **Tagline:** Together for a better tomorrow
- **Address:** Vill-Kalma 1 (Amtola), Post: Dairy Farm, P.S: Savar, Dhaka
- **Email:** kalmasocialclub24@gmail.com
- **Facebook:** https://www.facebook.com/profile.php?id=100068969464914
- **Founded:** 2024
- **Character:** non-political, non-communal, open to all ages; elders and
  youth hold equal standing. Work: blood donation, education support,
  relief distribution, youth development.

Content is **Bengali-first**. English only where a technical term has no
natural Bengali equivalent.

---

## 2. Stack (settled — do not re-litigate)

| Layer | Choice |
|---|---|
| Framework | TanStack Start 1.x (React + TypeScript), one app, SSR |
| Routing / data | TanStack Router, TanStack Query |
| UI | Tailwind CSS v4, shadcn/ui |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL on Neon (serverless driver over HTTP) |
| ORM | Drizzle |
| Auth | Better Auth — phone number + password, **no OTP, no SMS** |
| Image storage | Cloudflare R2 |
| Hosting | Cloudflare Workers |
| Domain | `kalmasocialclub.workers.dev` for now; custom domain later |

**Rejected, with reasons — do not suggest these again:**

- **NestJS** — a separate API server doubles deployment and type-sharing
  work for a small CRUD site. TanStack Start server functions cover it.
  Revisit only if a mobile app or third-party API consumer appears.
- **MongoDB / Mongoose** — the data is uniform and relational; Postgres
  enforces uniqueness and valid values at the database level, and reporting
  is plain SQL.
- **Prisma** — Prisma 7 dropped MongoDB, and its MongoDB support was always
  limited. Not relevant now that we are on Postgres, but Drizzle is the
  choice: lighter, SQL-first, works well on the Workers runtime.
- **OTP / SMS login** — ongoing cost and operational burden the club does
  not want.
- **Vercel** — the Hobby plan is restricted to non-commercial personal use
  and the wording is ambiguous for an organisation's site. Workers has no
  such clause, and R2 is already on Cloudflare.
- **A VPS** — no benefit at this scale; it would mean the club maintains OS
  updates, SSL renewal, backups and uptime. Revisit if free tiers are
  outgrown or long-running jobs are needed.
- **Image carousel / slider on the homepage** — grid gallery instead.
  Sliders hide content past the first slide. A lightbox on click is fine.

---

## 3. Privacy model — the most important rule

**Members' personal data is visible to admins only.** This is a deliberate
decision, not an oversight.

| Data | Public | Logged-in member | Admin |
|---|---|---|---|
| Name | no | no | yes |
| Phone | no | no | yes |
| Blood group | no | no | yes |
| Address | no | no | yes |
| Occupation | no | no | yes |

Members do **not** get a directory of each other. The public site shows
**counts only** — "O− : 3 donors" — with the club's contact number. When
someone needs blood they call the club; an admin looks it up and connects
them.

Consequences for the code:

- No member-facing endpoint ever returns another member's row.
- The members table and every member query sit behind an admin check on the
  **server function**, not only on the route. Route guards alone are not
  enough; server functions can be called directly.
- Member pages are `noindex` and behind auth.
- Never log phone numbers or addresses to the console or to error trackers.

**Legal context:** Bangladesh's Personal Data Protection Act, 2026 is in
force (opt-in consent model; health data is sensitive personal data; phone
numbers and addresses are protected). Blood group plausibly counts as
health data. Keep a consent checkbox on the membership form and store the
consent timestamp. Nobody here is a lawyer; flag anything that looks like it
needs one.

**Member login is not in v1.** Members would have nothing to see. Build the
`member` role and the password fields into the schema, but ship the public
site plus the admin panel first. Add member login when there is a reason
(self-service profile edits, dues history).

---

## 4. Roles

One column, three values — no permission framework.

```ts
role: 'super_admin' | 'admin' | 'member'
```

| Action | super_admin | admin | member |
|---|---|---|---|
| Activities, gallery, notices | yes | yes | read |
| Add / edit members | yes | yes | no |
| See phone, address, blood group | yes | yes | no |
| Delete a member | **yes** | no | no |
| Export CSV | **yes** | no | no |
| Create or remove admins | **yes** | no | no |

The three bold rows are the dangerous ones. Everything else is shared.

Other rules:
- Every admin has their own account. No shared passwords.
- Deleting a member archives for 30 days before real deletion.
- Log every password reset and every member deletion: who, whom, when.

---

## 5. Auth details

- **Identifier:** phone number, unique, normalised to `01XXXXXXXXX`
  (11 digits, no spaces, no country code).
- Write a single `normalizePhone()` helper and run it on **both** signup and
  login, so `+8801712345678`, `8801712345678` and `017-1234-5678` all resolve
  to the same stored value. This is the single most likely source of
  "my login doesn't work" bugs.
- **Email is optional** — store the column, leave it nullable. Later it
  enables self-service password reset.
- **Password reset is manual:** an admin generates a temporary password. Set
  `mustChangePassword = true`; the user cannot reach any other page until
  they set a new one. Same flag on first login after account creation.
- **Rate limit login:** 10 failed attempts on a phone number → locked 15
  minutes. Phone numbers are public knowledge locally, so the password is
  the only barrier.
- **Sessions last 60–90 days.** Members visit rarely; frequent re-login
  will drive them away.

---

## 6. Data model (starting point, not final)

```
members
  id, name, phone (unique, normalised), email (nullable),
  bloodGroup, address, area, occupation,
  role, passwordHash, mustChangePassword,
  status ('active' | 'pending' | 'suspended'),
  willingToDonate (bool), lastDonationDate (nullable),
  consentGivenAt, joinedAt, archivedAt (nullable)

activities
  id, title, slug, description, category, eventDate, eventTime,
  location, coverImageId, status ('draft' | 'published'),
  featured (bool), createdBy, createdAt, publishedAt

images
  id, r2Key, thumbR2Key, width, height, bytes,
  caption, activityId (nullable), uploadedBy, uploadedAt

notices
  id, title, body, urgent (bool), status, publishedAt, createdBy

auditLog
  id, actorId, action, targetType, targetId, meta (jsonb), createdAt
```

Indexes: `phone` (unique), `bloodGroup`, `status`, `activities.slug`
(unique), `activities.eventDate`.

---

## 7. Images

- Files go to **Cloudflare R2**; the database stores keys only.
- Resize and convert to **WebP in the browser** before upload
  (~1600px wide, roughly 250 KB), then upload directly to R2 with a
  presigned URL. The file never passes through the Worker.
- Store **two sizes per image**: a 400px thumbnail for grids and a 1600px
  version for the lightbox. Rural connections make this matter.
- The Worker binds to the R2 bucket directly — no S3 access keys needed when
  both live in the same Cloudflare account.
- R2's free tier is 10 GB with free egress, which is tens of thousands of
  optimised photos. It is an allowance, not a hard cap — set a billing alert
  in the Cloudflare dashboard.

---

## 8. Design

The approved design lives in a Claude Design canvas. Ask the user for the
link if you need it; the screens are: homepage, gallery, mobile home, admin
dashboard, admin members (with detail drawer), admin blood-donor lookup,
admin activity composer.

**Public site**
- Ground `#FBFBF9`, deep green `#0E3B2A`, accent green `#156845`,
  logo red `#C4342C` (used only for blood-related items).
- Headings `Anek Bangla`, body `Hind Siliguri` (both Google Fonts).
- Generous spacing, body text 17–19px — the audience includes older readers.

**Admin panel**
- Neutral chrome: background `#FAFAFA`, cards `#FFFFFF`, borders `#E4E4E7`,
  text `#18181B`, muted `#71717A`. Green `#15803D` as the only accent.
- Light sidebar, not dark.
- Denser: 14px base, 36px control height, 8–10px radius.
- Borders, not shadows. Shadows only on overlays.
- Right-hand drawer for detail views instead of a new page.
- `⌘K` command search in the top bar.

**House rules**
- No gradient washes, no emoji as UI glyphs, no fake phone status bars.
- Real `<button>`, `<a href>`, `<input>` + `<label>` — never a clickable div.
- Text contrast at least 4.5:1.
- Everything works at phone width.
- Placeholders stay visible as `[তারিখ]`, `[সংখ্যা]` etc. until the club
  supplies real values. Never invent a statistic, date or phone number.

---

## 9. Repo conventions

Monorepo, pnpm workspaces. Set up before writing feature code:

- TypeScript strict mode
- ESLint + Prettier (or Biome — pick one and say why)
- Husky + lint-staged: lint and typecheck on pre-commit
- commitlint with Conventional Commits
- `.env.example` committed; `.env` never
- CI/CD comes later — leave hooks in place for it

Pin dependency versions. TanStack Start ships releases every few days, and
the RC-to-1.0 transition already changed APIs (`.inputValidator()` was
removed). Read release notes before upgrading, and check the current docs
rather than older blog posts.

---

## 10. Working agreement

- Ask before adding sections, pages or content the user did not request.
- When the user asks for a small change, change only that.
- Do not invent facts the club has to supply. Use a visible placeholder.
- The user will provide credentials (Neon, Cloudflare, domain) when asked.
  Ask for one thing at a time, when it is actually needed.
