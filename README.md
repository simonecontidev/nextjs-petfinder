# 🐾 PetFinder — Lost & Found Animals Platform

**PetFinder** is a full-stack web application built with **Next.js 16**, designed to help users **report and locate lost or found pets** in their area.  
It combines a clean, accessible UI with secure authentication, a relational database, and an efficient media upload system — demonstrating advanced skills in **TypeScript, Prisma, and full-stack architecture**.

---

## 🚀 Live Demo

👉 [Demo Link (optional)](https://petfinder.simoneconti.work)  
_(Replace with your actual URL if hosted)_

---

## 🧠 Project Overview

PetFinder allows users to:

- Create listings for **lost or found animals** (dogs, cats, birds, etc.).
- Upload photos (up to 5MB) and describe the pet’s characteristics.
- View all listings filtered by **status** (Lost / Found / Resolved) and **animal type**.
- Log in securely to manage, update, or mark a case as resolved.

The goal was to build a **practical, production-ready full-stack app** that demonstrates database modeling, authentication flow, file handling, and reactive UI state — all within the **Next.js App Router** ecosystem.

---

## 🧩 Tech Stack

| Layer                  | Technology                                     |
| ---------------------- | ---------------------------------------------- |
| **Framework**          | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language**           | TypeScript                                     |
| **ORM**                | Prisma + SQLite                                |
| **Auth**               | Lucia v3 (Session-based authentication)        |
| **UI**                 | React + Material UI + Framer Motion            |
| **Forms & Validation** | Zod                                            |
| **Image Handling**     | Node `fs` + crypto (secure upload & renaming)  |
| **Hosting**            | Vercel / Hostinger (Static Export)             |

---

## ⚙️ Features

- 🐶 **Dynamic Listings** — Users can add, edit, and filter lost/found animals.
- 🔒 **Lucia Authentication** — Secure session-based login with cookies.
- 🧾 **Form Validation** — Strongly typed schema validation via Zod.
- 🗃️ **Database Modeling** — Prisma schema defining `User`, `Listing`, and `Session` relations.
- 📸 **Image Uploads** — Server-side storage with MIME and size validation.
- ⚡ **App Router Architecture** — Optimized for revalidation and incremental static rendering.
- 🎨 **Modern UI/UX** — Material UI + Framer Motion animations.
- 🧠 **Clean Code** — Modular architecture, clear folder structure, and reusable components.

---

## 🗂️ Folder Structure

src/
┣ app/
┃ ┣ listings/
┃ ┃ ┣ new/page.tsx # Create new listing form
┃ ┃ ┗ [id]/page.tsx # Single listing details
┃ ┣ dashboard/page.tsx # User dashboard
┃ ┣ login/page.tsx # Login / signup
┃ ┗ layout.tsx # Shared layout & Header
┣ lib/
┃ ┣ db.ts # Prisma client
┃ ┣ auth.ts # Lucia configuration
┗ components/
┣ Header.tsx
┣ ListingCard.tsx
┗ ListingForm.tsx

---

## 🧱 Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  listings  Listing[]
  sessions  Session[]
}

model Listing {
  id          String   @id @default(cuid())
  title       String
  description String
  animalType  String
  status      String
  city        String?
  image       String?
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  createdAt   DateTime  @default(now())
}

model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 💡 Key Learnings

- Full session management using **Lucia Auth v3** integrated with **Next.js App Router**.
- **Server Actions** and **revalidatePath** for smooth form submission UX.
- Secure and performant **file uploads** via Node’s native API (no external dependency).
- Strongly typed validation pipeline with **Zod** and **TypeScript**.
- Creating a **modular, scalable Next.js structure** ready for real-world deployment.

---

## 🧑‍💻 Author

**Simone Conti**
Full-Stack Developer & Designer
🌍 [simoneconti.work](https://simoneconti.work) — [LinkedIn](https://www.linkedin.com/in/simonecontidev) — [GitHub](https://github.com/simoneconti)

---

## 🧭 Future Improvements

- Add **map integration** (Leaflet + geolocation).
- Implement **email notifications** when a nearby match is found.
- Allow **multi-image upload** and cloud storage (e.g., S3, Cloudinary).
- Add **API endpoints** for mobile app use.
- Introduce **internationalization (i18n)**.

---

## 🐾 Why This Project Matters

PetFinder isn’t just a technical demo — it’s a compassionate, real-world use case.
It demonstrates how **technology, design, and empathy** can come together to solve meaningful problems — and how a developer can build **end-to-end production features** with clarity, scalability, and human purpose.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" alt="Next.js Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma Badge"/>
  <img src="https://img.shields.io/badge/Lucia%20Auth-4B32C3?logo=auth0&logoColor=white" alt="Lucia Auth Badge"/>
  <img src="https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white" alt="Material UI Badge"/>
  <img src="https://img.shields.io/badge/Framer%20Motion-E91E63?logo=framer&logoColor=white" alt="Framer Motion Badge"/>
</p>

<h1 align="center">🐾 PetFinder — Lost & Found Animals Platform</h1>

<p align="center">
  <b>Full-stack Next.js app for reporting and finding lost pets.</b><br/>
  Built with ❤️ by <a href="https://simoneconti.work">Simone Conti</a> — <a href="https://www.linkedin.com/in/simonecontidev">LinkedIn</a> — <a href="https://github.com/simoneconti">GitHub</a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-key-learnings">Key Learnings</a> •
  <a href="#-future-improvements">Future Improvements</a>
</p>

<p align="center">
  ⭐️ If you like this project, consider giving it a star — it really helps!
</p>

---

```

```
