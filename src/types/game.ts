export interface Location {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface GameObject {
  id: number;
  name: string;
  type: string;
  location: string;
  image: string;
}

export interface GameState {
  gameObjects: GameObject[];
  locations: Location[];
  selectedObject: GameObject | null;
  targetLocation: Location | null;
  isAnimating: boolean;
}

export interface IntentResult {
  success: boolean;
  object: GameObject | null;
  location: Location | null;
  message: string;
}

export interface ProcessIntentRequest {
  prompt: string;
  image: File;
} 