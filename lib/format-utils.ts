/**
 * Formatting utilities for displaying game data
 */

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "150m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }

  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}

/**
 * Format score with thousands separator
 * @param score Score value
 * @returns Formatted string (e.g., "4,250")
 */
export function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

/**
 * Format coordinates for display
 * @param lat Latitude
 * @param lng Longitude
 * @param precision Number of decimal places (default: 6)
 * @returns Formatted string (e.g., "41.504500, -81.608700")
 */
export function formatCoordinates(
  lat: number,
  lng: number,
  precision: number = 6
): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Format game duration in seconds
 * @param seconds Total seconds
 * @returns Formatted string (e.g., "2m 34s" or "45s")
 */
export function formatGameDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format round number for display
 * @param current Current round (1-5)
 * @param total Total rounds (default: 5)
 * @returns Formatted string (e.g., "Round 3/5")
 */
export function formatRound(current: number, total: number = 5): string {
  return `Round ${current}/${total}`;
}

/**
 * Get maximum possible score for a game
 * @param rounds Number of rounds (default: 5)
 * @returns Maximum score (5000 points per round)
 */
export function getMaxScore(rounds: number = 5): number {
  return rounds * 5000;
}

/**
 * Get score quality label based on score
 * @param score Score value
 * @param maxScore Maximum possible score (default: 25000 for 5 rounds)
 * @returns Quality label
 */
export function getScoreQuality(score: number, maxScore: number = 25000): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'Perfect!';
  if (percentage >= 80) return 'Excellent!';
  if (percentage >= 60) return 'Great!';
  if (percentage >= 40) return 'Good!';
  if (percentage >= 20) return 'Not bad!';
  return 'Keep trying!';
}

/**
 * Get distance quality label based on distance
 * @param meters Distance in meters
 * @returns Quality label
 */
export function getDistanceQuality(meters: number): string {
  if (meters < 10) return 'Spot on!';
  if (meters < 50) return 'Very close!';
  if (meters < 100) return 'Close!';
  if (meters < 250) return 'Not too far!';
  if (meters < 500) return 'Getting warmer!';
  return 'Keep exploring!';
}
