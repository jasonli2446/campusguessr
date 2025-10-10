import { LandingHero } from "@/components/landing-hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

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
