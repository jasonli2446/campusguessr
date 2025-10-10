import { DeployButton } from "@/app/components/deploy-button";
import { EnvVarWarning } from "@/app/components/env-var-warning";
import { AuthButton } from "@/app/components/auth-button";
import { Hero } from "@/app/components/hero";
import { ThemeSwitcher } from "@/app/components/theme-switcher";
import RoundResults from "@/app/components/RoundResults";
import { ConnectSupabaseSteps } from "@/app/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/app/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-3xl flex justify-end p-4">
        <ThemeSwitcher />
      </div>
      <Hero />
      {/* Basic round results component */}
      <div className="w-full max-w-3xl p-4">
        <RoundResults title="Last round" score={42} />
      </div>
    </main>
  );
}
