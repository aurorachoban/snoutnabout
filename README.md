# Snout & About 🐾

A full-stack pet supplies e-commerce web application built for CPRG306 at SAIT. Shop premium food, toys, treats, and accessories for dogs and cats.

## Features

- **Product catalogue** — browse all products with filtering by category, type, price range, and sorting
- **Search** — keyword search across product names and descriptions
- **Product detail pages** — image gallery, size/variant selector, ingredient breakdown, and tabbed info
- **Shopping cart** — persistent cart using localStorage
- **Authentication** — sign up and log in with email and password via Firebase Auth
- **Wishlist** — save favourite products (requires login)
- **Admin dashboard** — protected route for managing products (add, edit, delete, toggle stock/featured)
- **Firestore seed script** — quickly populate the database with sample products

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Vercel (recommended) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root with your Firebase project credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
ADMIN_EMAIL=your_admin_email@example.com
```

### 3. Seed the database

Populate Firestore with the 12 sample products:

```bash
npm run seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database** in test mode
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Copy your web app credentials into `.env.local`

## Project Structure

```
app/
  page.js              # Home page
  products/
    page.js            # Product listing with filters
    [id]/page.js       # Product detail page
  cart/page.js         # Shopping cart
  auth/page.js         # Login / Sign up
  admin/page.js        # Admin dashboard (protected)
components/            # Shared UI components
contexts/              # React context (Cart, Auth)
lib/                   # Firebase config
scripts/seed.js        # Firestore seed script
public/products/       # Product images
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run seed` | Seed Firestore with sample products |
| `npm run lint` | Run ESLint |

## Credits

- **Student:** Aurora Choban
- **Instructor:** Ashlyn Knox
- **Course:** CPRG306 — Southern Alberta Institute of Technology (SAIT)
