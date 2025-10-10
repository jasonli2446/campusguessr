import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="CampusGuessr Logo"
            width={36}
            height={36}
            className="rounded"
          />
          <span className="text-xl font-bold text-cwru-blue dark:text-cwru-true-blue">
            CampusGuessr
          </span>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <AuthButton />
          <div className="h-6 w-px bg-border" /> {/* Divider */}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
