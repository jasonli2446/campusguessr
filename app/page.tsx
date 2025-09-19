import { ThemeSwitcher } from "@/components/theme-switcher";
import { LandingHero } from "@/components/landing-hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="text-xl font-bold text-blue-600 dark:text-blue-400">
              CampusGuessr
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center">
        <LandingHero />
      </div>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t border-t-foreground/10 bg-white dark:bg-gray-900 text-center text-xs gap-8 py-8">
        <p className="text-gray-600 dark:text-gray-400">
          Built for Case Western Reserve University • Collaborative Coding Club
        </p>
      </footer>
    </main>
  );
}
