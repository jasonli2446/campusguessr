import { PlayButton } from "./play-button";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Trophy } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative text-center py-20 px-4 overflow-hidden w-full min-h-[600px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/cwru.png"
          alt="CWRU Campus"
          fill
          className="object-cover opacity-70"
          priority
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to{" "}
          <span className="text-cwru-blue dark:text-cwru-true-blue">CampusGuessr</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Explore CWRU Campus in 360°
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <PlayButton />
          <Link href="/leaderboard">
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-2 border-cwru-blue dark:border-cwru-true-blue hover:bg-cwru-blue hover:text-white dark:hover:bg-cwru-true-blue transition-all gap-2"
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
