import { PlayButton } from "./play-button";
import Image from "next/image";

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
        </div>
      </div>
    </section>
  );
}
