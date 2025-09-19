import { PlayButton } from "./play-button";

export function LandingHero() {
  return (
    <section className="text-center py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to{" "}
          <span className="text-blue-600 dark:text-blue-400">CampusGuessr</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Test your knowledge of Case Western Reserve University
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <PlayButton />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No account required • Free to play
          </p>
        </div>
      </div>
    </section>
  );
}
