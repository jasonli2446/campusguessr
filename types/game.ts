// Database table types matching Supabase schema

export interface Location {
  id: string; // UUID
  image_url: string; // Path in Supabase Storage
  latitude: number; // DECIMAL(10, 8)
  longitude: number; // DECIMAL(11, 8)
  created_at: string; // TIMESTAMPTZ (ISO string)
  created_by?: string; // UUID reference to auth.users
}

export interface Guess {
  round: number; // 1-5
  lat: number;
  long: number;
  distance: number; // meters
  score: number; // 0-5000
}

export interface GameSession {
  id: string; // UUID
  session_token: string;
  current_round: number; // 0-5
  total_score: number;
  location_ids: string[]; // Array of 5 UUIDs
  guesses: Guess[]; // JSONB array
  created_at: string; // TIMESTAMPTZ (ISO string)
}

// Utility types

export interface Coordinates {
  lat: number;
  lng: number;
}

// API Request/Response types

export interface StartGameRequest {
  session_token: string;
}

export interface StartGameResponse {
  session_id: string;
  location_ids: string[];
  first_location: Location;
}

export interface SubmitGuessRequest {
  session_id: string;
  round: number;
  latitude: number;
  longitude: number;
}

export interface SubmitGuessResponse {
  guess: Guess;
  actual_location: Coordinates;
  next_location?: Location; // undefined if game is over
  game_completed: boolean;
  total_score: number;
}

export interface GetGameResultsRequest {
  session_id: string;
}

export interface GetGameResultsResponse {
  session: GameSession;
  locations: Location[]; // Full location data for each round
}

export interface UploadImageRequest {
  image: string; // base64
  latitude: number;
  longitude: number;
  username: string; // UUID
}

export interface UploadImageResponse {
  location_id: string;
  image_url: string;
}
