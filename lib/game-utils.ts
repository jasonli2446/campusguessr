/**
 * Core game calculation utilities for CampusGuessr
 */

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters, rounded to nearest meter
}

/**
 * Calculate score based on distance
 * Perfect score (5000) for <20m, then gentler exponential decay
 * @param distanceMeters Distance in meters
 * @returns Score between 0 and 5000
 */
export function calculateScore(distanceMeters: number): number {
  // Perfect score for anything within 20m
  if (distanceMeters <= 20) {
    return 5000;
  }

  // Gentler exponential decay starting from 20m
  const k = 0.004;
  const adjustedDistance = distanceMeters - 20;
  const score = Math.round(5000 * Math.exp(-k * adjustedDistance));

  // Clamp between 0 and 5000
  return Math.max(0, Math.min(5000, score));
}

/**
 * Calculate total possible score for a game
 * @param numRounds Number of rounds in the game (default 5)
 * @returns Maximum possible score
 */
export function getMaxScore(numRounds: number = 5): number {
  return numRounds * 5000;
}
