import { defineQuery } from "next-sanity";

export const ALL_DOGS_QUERY = defineQuery(`
  *[_type == "dog"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    breed,
    dateOfBirth,
    sex,
    size,
    weight,
    adoptionFee,
    temperament,
    energyLevel,
    description,
    image,
    goodWithKids,
    goodWithDogs,
    goodWithCats,
    spayedNeutered,
    vaccinated,
    houseTrained,
    crateTrained,
    microchipped,
    specialNeeds,
    coatLength,
    color,
    hypoallergenic,
    barking,
    dateArrivedAtShelter
  }
`);
