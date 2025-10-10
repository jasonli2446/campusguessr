import React from "react";
//import {useState} from "react"

// Props shape for the RoundResults component. Extend as needed.
export interface RoundResultsProps {
	title?: string;
	score?: number;
}

/**
 * RoundResults - a small, typed React function component scaffold.
 * Replace or extend this with real UI and logic as you implement the feature.
 */
export default function RoundResults({ title = "Round Results", score }: RoundResultsProps) {
	return (
		<section aria-labelledby="round-results-title" className="rounded-md p-4 bg-white/5">
			<h2 id="round-results-title" className="text-lg font-semibold">
				{title}
			</h2>
			<p className="mt-2 text-sm text-zinc-400">
				{typeof score === "number" ? `Score: ${score}` : "No score available yet."}
			</p>
			{/* TODO: add map / list / visualisation components here */}
		</section>
	);
}
