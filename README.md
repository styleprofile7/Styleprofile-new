# StyleProfile — Next.js 14

A fashion identity platform built with Next.js 14 (App Router), Firebase, and Framer Motion.

## Stack
- **Framework**: Next.js 14 App Router
- **Auth & DB**: Firebase (Auth + Firestore + Storage)
- **Email**: EmailJS
- **Animations**: Framer Motion
- **Swipe**: react-tinder-card

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for production
```bash
npm run build
npm start
```

## Deploy to Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel login
vercel
```

Vercel auto-detects Next.js. No config needed.

## Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy .next --project-name styleprofile
```

Note: For Cloudflare Pages with Next.js, you may need:
```bash
npm install @cloudflare/next-on-pages
```

## Project Structure

```
styleprofile-next/
├── app/
│   ├── layout.jsx          # Root layout with Navbar + AuthProvider
│   ├── page.jsx            # Home feed / Hero
│   ├── globals.css         # All global styles
│   ├── quiz/page.jsx       # Fashion Identity Quiz (10 categories)
│   ├── login/page.jsx      
│   ├── signup/page.jsx     
│   ├── profile/page.jsx    
│   ├── closet/page.jsx     
│   ├── upload/page.jsx     
│   ├── ambassador/page.jsx 
│   ├── about/page.jsx      
│   └── privacy/page.jsx    
├── components/
│   ├── Navbar.jsx          # Fixed nav with search + dropdown
│   ├── OutfitCard.jsx      # SP card with like/rate/vote
│   └── Toast.jsx           
├── context/
│   └── AuthContext.jsx     # Firebase auth state + signup/login/logout
└── utils/
    ├── firebase.js         # Firebase init + EmailJS
    └── quizData.js         # 10 quiz questions + 8 archetypes
```

## Firebase Setup
Your existing Firebase project is already configured. Make sure these domains are in Firebase Console → Authentication → Authorized Domains:
- `localhost`
- `styleprofile.co`
- `www.styleprofile.co`
- Your Vercel/Cloudflare deployment URL
