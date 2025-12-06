export type Gender = "male" | "female" | "other";
export type MeasurementSystem = "metric" | "imperial";
export type BodyType =
  | "underweight"
  | "slim"
  | "average"
  | "athletic"
  | "overweight";

export interface UserProfile {
  id: string;
  username: string;
  age: number;
  gender: Gender;
  height: number; // in centimeters
  weight: number; // in kilograms
  measurement_system?: MeasurementSystem;
  body_type: BodyType;
  avatar_url: string | null;
  profile_photo_url: string | null;
  avatar_regenerations_left: number;
  try_ons_left: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingFormData {
  username: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  measurement_system: MeasurementSystem;
  body_type: BodyType;
}

export interface AvatarHistory {
  id: string;
  user_id: string;
  avatar_url: string;
  is_selected: boolean;
  generation_number: number;
  created_at: string;
}
