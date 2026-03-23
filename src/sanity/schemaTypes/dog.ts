import { defineType, defineField } from "sanity";

export const dog = defineType({
  name: "dog",
  title: "Dogs",
  type: "document",
  fieldsets: [
    {
      name: "compatibility",
      title: "Compatibility",
    },
    {
      name: "healthCare",
      title: "Health & Care",
    },
    {
      name: "appearanceBehavior",
      title: "Appearance & Behavior",
    },
    {
      name: "shelterInfo",
      title: "Shelter Info",
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "breed",
      title: "Breed",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dateOfBirth",
      title: "Date of Birth",
      type: "date",
    }),
    defineField({
      name: "sex",
      title: "Sex",
      type: "string",
      options: {
        list: ["male", "female"],
        layout: "radio",
      },
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: ["small", "medium", "large"],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weight",
      title: "Weight (lbs)",
      type: "number",
      validation: (rule) => rule.min(0).max(200),
    }),
    defineField({
      name: "adoptionFee",
      title: "Adoption Fee ($)",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "temperament",
      title: "Temperament",
      type: "string",
      options: {
        list: [
          "calm",
          "friendly",
          "playful",
          "loyal",
          "gentle",
          "energetic",
          "independent",
          "affectionate",
        ],
      },
    }),
    defineField({
      name: "energyLevel",
      title: "Energy Level",
      type: "string",
      options: {
        list: ["low", "moderate", "high"],
        layout: "radio",
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),

    // Compatibility
    defineField({
      name: "goodWithKids",
      title: "Good with Kids",
      type: "boolean",
      initialValue: false,
      fieldset: "compatibility",
    }),
    defineField({
      name: "goodWithDogs",
      title: "Good with Dogs",
      type: "boolean",
      initialValue: false,
      fieldset: "compatibility",
    }),
    defineField({
      name: "goodWithCats",
      title: "Good with Cats",
      type: "boolean",
      initialValue: false,
      fieldset: "compatibility",
    }),

    // Health & Care
    defineField({
      name: "spayedNeutered",
      title: "Spayed/Neutered",
      type: "boolean",
      initialValue: false,
      fieldset: "healthCare",
    }),
    defineField({
      name: "vaccinated",
      title: "Vaccinated",
      type: "boolean",
      initialValue: false,
      fieldset: "healthCare",
    }),
    defineField({
      name: "houseTrained",
      title: "House Trained",
      type: "boolean",
      initialValue: false,
      fieldset: "healthCare",
    }),
    defineField({
      name: "crateTrained",
      title: "Crate Trained",
      type: "boolean",
      initialValue: false,
      fieldset: "healthCare",
    }),
    defineField({
      name: "microchipped",
      title: "Microchipped",
      type: "boolean",
      initialValue: false,
      fieldset: "healthCare",
    }),
    defineField({
      name: "specialNeeds",
      title: "Special Needs",
      type: "text",
      rows: 3,
      fieldset: "healthCare",
    }),

    // Appearance & Behavior
    defineField({
      name: "coatLength",
      title: "Coat Length",
      type: "string",
      options: {
        list: ["short", "medium", "long"],
        layout: "radio",
      },
      fieldset: "appearanceBehavior",
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      options: {
        list: [
          "black",
          "white",
          "brown",
          "golden",
          "tan",
          "red",
          "gray",
          "brindle",
          "spotted",
          "merle",
          "bi-color",
          "tri-color",
        ],
      },
      fieldset: "appearanceBehavior",
    }),
    defineField({
      name: "hypoallergenic",
      title: "Hypoallergenic",
      type: "boolean",
      initialValue: false,
      fieldset: "appearanceBehavior",
    }),
    defineField({
      name: "barking",
      title: "Barking Level",
      type: "string",
      options: {
        list: ["low", "moderate", "high"],
        layout: "radio",
      },
      fieldset: "appearanceBehavior",
    }),

    // Shelter Info
    defineField({
      name: "dateArrivedAtShelter",
      title: "Date Arrived at Shelter",
      type: "date",
      fieldset: "shelterInfo",
    }),
    defineField({
      name: "readyForAdoption",
      title: "Ready for Adoption",
      type: "boolean",
      initialValue: false,
      fieldset: "shelterInfo",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "breed",
      media: "image",
    },
  },
});
