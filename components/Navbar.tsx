import Link from "next/link";
import AuthControls from "./AuthControls";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          AI Trip Planner
        </Link>
        <AuthControls />
      </div>
    </nav>
  );
}

