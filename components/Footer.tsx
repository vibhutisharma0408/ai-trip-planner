"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row">
        <div>
          © {new Date().getFullYear()} vibhuti sharma
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/vibhutisharma0408"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-slate-900"
          >
            GitHub
          </Link>
          <Link
            href="https://www.linkedin.com/in/vibhuti-sharma-1280b7215/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-slate-900"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
