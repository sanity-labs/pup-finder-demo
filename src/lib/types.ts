export interface Dog {
  _id: string;
  name: string;
  slug: string;
  breed: string;
  dateOfBirth?: string;
  sex?: string;
  size: string;
  weight?: number;
  adoptionFee?: number;
  temperament?: string;
  energyLevel?: string;
  description?: string;
  image?: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  };
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  spayedNeutered?: boolean;
  vaccinated?: boolean;
  houseTrained?: boolean;
  crateTrained?: boolean;
  microchipped?: boolean;
  specialNeeds?: string;
  coatLength?: string;
  color?: string;
  hypoallergenic?: boolean;
  barking?: string;
  dateArrivedAtShelter?: string;
}

export interface FollowUpQuestion {
  question: string;
  options: string[];
}

export interface DogProfile {
  id: string;
  name: string;
  subtitle: string;
  traits: string[];
  tagline: string;
}
