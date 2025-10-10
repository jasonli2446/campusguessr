/**
 * Coordinate validation and boundary checking utilities
 */

import { Coordinates } from '@/types/game';

/**
 * CWRU campus boundaries
 * Based on approximate campus extent
 */
export const CWRU_BOUNDS = {
  north: 41.512, // Northern edge
  south: 41.498, // Southern edge
  east: -81.595, // Eastern edge
  west: -81.615, // Western edge
} as const;

/**
 * CWRU campus center point
 */
export const CWRU_CENTER: Coordinates = {
  lat: 41.5045,
  lng: -81.6087,
} as const;

/**
 * Validate that coordinates are within valid lat/lng ranges
 * @param lat Latitude to validate
 * @param lng Longitude to validate
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }

  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }

  // Valid latitude range: -90 to 90
  if (lat < -90 || lat > 90) {
    return false;
  }

  // Valid longitude range: -180 to 180
  if (lng < -180 || lng > 180) {
    return false;
  }

  return true;
}

/**
 * Check if coordinates are within CWRU campus bounds
 * Useful for validating location uploads and guesses
 * @param lat Latitude to check
 * @param lng Longitude to check
 * @returns True if within campus bounds
 */
export function isWithinCampus(lat: number, lng: number): boolean {
  if (!isValidCoordinate(lat, lng)) {
    return false;
  }

  return (
    lat >= CWRU_BOUNDS.south &&
    lat <= CWRU_BOUNDS.north &&
    lng >= CWRU_BOUNDS.west &&
    lng <= CWRU_BOUNDS.east
  );
}

/**
 * Validate coordinates object
 * @param coords Coordinates to validate
 * @returns True if valid
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return coords && isValidCoordinate(coords.lat, coords.lng);
}

/**
 * Validate that coordinates are within campus bounds
 * Throws an error with a descriptive message if invalid
 * @param lat Latitude
 * @param lng Longitude
 * @param fieldName Optional field name for error message
 * @throws Error if coordinates are invalid or outside campus
 */
export function validateCampusCoordinates(
  lat: number,
  lng: number,
  fieldName: string = 'Coordinates'
): void {
  if (!isValidCoordinate(lat, lng)) {
    throw new Error(`${fieldName} are invalid. Lat: ${lat}, Lng: ${lng}`);
  }

  if (!isWithinCampus(lat, lng)) {
    throw new Error(
      `${fieldName} are outside CWRU campus bounds. Lat: ${lat}, Lng: ${lng}`
    );
  }
}
