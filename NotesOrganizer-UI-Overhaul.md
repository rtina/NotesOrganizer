# Notes Organizer UI Overhaul — Minimalist SaaS Style

## List of Modified Files

- web/src/app/layout.tsx
- web/src/app/globals.css
- web/src/app/notes/page.tsx
- web/src/app/notes/[id]/page.tsx
- web/src/app/notes/new/page.tsx
- web/src/app/notes/login/page.tsx
- web/src/app/notes/register/page.tsx
- web/src/components/Navbar.tsx
- web/src/components/NoteCard.tsx
- web/src/components/NoteEditor.tsx
- web/src/components/ThemeToggle.tsx
- web/src/components/VisibilitySelect.tsx

---

## web/src/app/layout.tsx

```tsx
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'
import ThemeToggle from '../components/ThemeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Notes Organizer',
  description: 'Minimalist SaaS-style notes dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-zinc-950 text-zinc-100">
      <body className={`${inter.className} h-full min-h-screen flex flex-col bg-zinc-950`}>
        <Navbar />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Notes Organizer
        </footer>
        <ThemeToggle />
      </body>
    </html>
  )
}
```

---

## web/src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  height: 100%;
  background: #09090b;
}

body {
  font-family: 'Inter', 'Geist', ui-sans-serif, system-ui, sans-serif;
  color: #f4f4f5;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

a {
  @apply text-zinc-300 hover:text-zinc-100 transition-colors;
}

input, textarea, select {
  @apply bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition;
}

button {
  @apply rounded-md px-4 py-2 font-medium transition-colors;
}

.card {
  @apply bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm;
}
```

---

## web/src/app/notes/page.tsx

```tsx
import NoteCard from '../../components/NoteCard'

export default function NotesPage() {
  // Replace with real data fetching
  const notes = [
    { id: '1', title: 'First Note', content: 'This is a sample note.', updatedAt: '2026-02-01' },
    { id: '2', title: 'Second Note', content: 'Another note here.', updatedAt: '2026-01-30' },
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">My Notes</h1>
        <a
          href="/notes/new"
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
        >
          + New Note
        </a>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </section>
  )
}
```

---

## web/src/app/notes/[id]/page.tsx

```tsx
import NoteEditor from '../../../components/NoteEditor'

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  // Replace with real data fetching
  const note = {
    id: params.id,
    title: 'Sample Note',
    content: 'Edit your note here...',
    updatedAt: '2026-02-01',
  }

  return (
    <section className="max-w-2xl mx-auto">
      <NoteEditor note={note} />
    </section>
  )
}
```

---

## web/src/app/notes/new/page.tsx

```tsx
import NoteEditor from '../../../components/NoteEditor'

export default function NewNotePage() {
  return (
    <section className="max-w-2xl mx-auto">
      <NoteEditor note={null} />
    </section>
  )
}
```

---

## web/src/app/notes/login/page.tsx

```tsx
export default function LoginPage() {
  return (
    <section className="max-w-sm mx-auto card p-8 mt-16">
      <h1 className="text-xl font-semibold mb-6 text-center">Sign in to Notes Organizer</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-zinc-400 mb-1" htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" className="w-full" />
        </div>
        <div>
          <label className="block text-zinc-400 mb-1" htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" className="w-full" />
        </div>
        <button
          type="submit"
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-lg py-2 mt-2 transition-colors"
        >
          Sign In
        </button>
      </form>
      <div className="text-xs text-zinc-500 text-center mt-4">
        Don&apos;t have an account? <a href="/notes/register" className="underline">Register</a>
      </div>
    </section>
  )
}
```

---

## web/src/app/notes/register/page.tsx

```tsx
export default function RegisterPage() {
  return (
    <section className="max-w-sm mx-auto card p-8 mt-16">
      <h1 className="text-xl font-semibold mb-6 text-center">Create your account</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-zinc-400 mb-1" htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="you@example.com" className="w-full" />
        </div>
        <div>
          <label className="block text-zinc-400 mb-1" htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="••••••••" className="w-full" />
        </div>
        <button
          type="submit"
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-lg py-2 mt-2 transition-colors"
        >
          Register
        </button>
      </form>
      <div className="text-xs text-zinc-500 text-center mt-4">
        Already have an account? <a href="/notes/login" className="underline">Sign in</a>
      </div>
    </section>
  )
}
```

---

## web/src/components/Navbar.tsx

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/notes', label: 'Notes' },
  { href: '/notes/new', label: 'New' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-30 w-full bg-zinc-950/80 border-b border-zinc-800 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-100">
          Notes Organizer
        </Link>
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="md:hidden">
          {/* Mobile menu button (implement drawer if needed) */}
          <button
            className="p-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition"
            aria-label="Open menu"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h14M3 12h14M3 18h14" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
```

---

## web/src/components/NoteCard.tsx

```tsx
import Link from 'next/link'

export default function NoteCard({ note }: { note: { id: string, title: string, content: string, updatedAt: string } }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="card group flex flex-col p-5 hover:shadow-lg hover:border-zinc-700 transition-all cursor-pointer"
    >
      <h2 className="text-lg font-semibold mb-2 group-hover:text-zinc-100 transition-colors truncate">{note.title}</h2>
      <p className="text-zinc-400 text-sm mb-4 line-clamp-3">{note.content}</p>
      <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
        <span>Last edited: {note.updatedAt}</span>
        <span className="inline-block bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">Draft</span>
      </div>
    </Link>
  )
}
```

---

## web/src/components/NoteEditor.tsx

```tsx
'use client'

import { useState } from 'react'
import VisibilitySelect from './VisibilitySelect'

export default function NoteEditor({ note }: { note: any }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [visibility, setVisibility] = useState('private')

  return (
    <form className="card p-6 flex flex-col gap-6">
      <div>
        <label className="block text-zinc-400 mb-1" htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          className="w-full"
          placeholder="Note title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-zinc-400 mb-1" htmlFor="content">Content</label>
        <textarea
          id="content"
          className="w-full min-h-[160px] resize-vertical"
          placeholder="Write your note here..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <VisibilitySelect value={visibility} onChange={setVisibility} />
        <button
          type="submit"
          className="ml-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-lg px-6 py-2 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  )
}
```

---

## web/src/components/ThemeToggle.tsx

```tsx
'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-800 rounded-full p-3 shadow-lg hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
      onClick={() => setDark(d => !d)}
      type="button"
    >
      {dark ? (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10" cy="10" r="6" />
        </svg>
      ) : (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 2v2M10 16v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M2 10h2M16 10h2M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  )
}
```

---

## web/src/components/VisibilitySelect.tsx

```tsx
export default function VisibilitySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-zinc-400 mb-1" htmlFor="visibility">Visibility</label>
      <select
        id="visibility"
        className="w-full"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>
    </div>
  )
}
```

---

# Notes

- All components use Tailwind CSS for styling, with a focus on a neutral zinc/slate palette, subtle borders, and crisp typography.
- Layout is responsive: the navbar collapses to a mobile menu button on small screens (implement a drawer for full mobile UX if desired).
- The design is minimalist, with clear spacing, hover/active states, and a professional SaaS feel.
- The code is ready to copy-paste into your project. Adjust data fetching and logic as needed for your backend.

---
