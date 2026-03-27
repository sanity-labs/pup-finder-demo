import type { Dog, FilterCriterion } from "./types";

export function filterDogs(
  allDogs: Dog[],
  matchedIds: string[],
  filters: FilterCriterion[]
): Dog[] {
  let dogs = allDogs.filter((d) => matchedIds.includes(d._id));

  for (const filter of filters) {
    dogs = dogs.filter((dog) => {
      const fieldValue = dog[filter.field];

      switch (filter.filterType) {
        case "exact":
          return fieldValue === filter.value;

        case "includes":
          return (
            typeof fieldValue === "string" &&
            typeof filter.value === "string" &&
            fieldValue.toLowerCase().includes(filter.value.toLowerCase())
          );

        case "boolean":
          if (filter.value === "any") return true;
          return fieldValue === true;

        default:
          return true;
      }
    });
  }

  return dogs;
}
