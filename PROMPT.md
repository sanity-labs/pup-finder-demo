## Project Overview

Build a Next.js app (App Router) that helps users find their perfect dog using AI-powered matching. The data lives in Sanity and the AI layer uses Sanity Agent Context via MCP to query and reason about the dogs. Use the npx sanity-io/agent-context skill for implementing AI responses. Use sanity-io/agent-toolkit skills for best sanity practices

## Tech Stack (use current versions of everything)

- Next.js 16 (App Router)
- next-sanity (https://github.com/sanity-io/next-sanity) for Sanity client, image URL builder, embedded studio, and direct queries. We dont need live-api
  - an embedded Sanity Studio (reference the next-sanity docs)
- Tailwind CSS
- use the latest version of everything unless there is a conflict

## Agent Context Setup

Use the Sanity MCP to find setup instructions for `@sanity/agent-context/studio` and add it to the sanity config

## Architecture

### Data Fetching

- Initial page load: fetch all dogs directly via next-sanity GROQ query (faster than going through AI for the initial list)
- Use `@sanity/image-url` for optimized image URLs
- Consider using `'use cache'` directive for the initial dog list (Next.js 16 Cache Components)

## UX Flow

### Step 1: Landing Page

- Grid of all dog cards
- Large centered text input near the top: "Describe your perfect dog..."

### Step 2: AI Matching

- User submits description of what they are looking for
- Response filters the displayed dogs and shows a friendly summary.
- Use data from Sanity to show the users dogs that are a good fit

### Step 3: Follow-up Questions

- If 4+ dogs remain, the AI returns one round of follow up questions, curated to slim down the results
- Display as clickable pills/buttons, Example: "Do you have cats in the house? Yes / No"
- Only one round of followup questions
- IMPORTANT: Follow-up rounds must preserve all constraints from the original query - or apply the new filters to the still left list of dogs

### Step 4: Dog Cards

- Photo, name, breed, age,
- Clicking card opens detail modal
- "Choose [Name]" button

### Step 5: Detail Modal

- Full info, larger photo, animated entrance
- Close button and click-outside-to-close
- All all dog detail (get from sanity schema)

### Step 6: Confetti

- Clicking "Choose" triggers full-screen confetti animation
- Show celebration message with the dog's name
- Use canvas-confetti npm package

## Design

- bold maximalist style with vibrant colors, gradients, layered shadows, mixed typography, decorative patterns, and high visual energy and fun!
- every dog should have its own color pop

## Sanity schema

Use the sanity schema listed below.

Dog:

Create a Sanity document schema for `dog` with these fields:

**Core fields:**

- `name` (string, required)
- `slug` (slug, sourced from name, required)
- `breed` (string, required)
- `dateOfBirth` (date)
- `sex` (string, radio: male/female)
- `size` (string, radio: small/medium/large, required)
- `weight` (number, 0-200, label "Weight (lbs)")
- `adoptionFee` (number, min 0, label "Adoption Fee ($)")
- `temperament` (string, dropdown: calm/friendly/playful/loyal/gentle/energetic/independent/affectionate)
- `energyLevel` (string, radio: low/moderate/high)
- `description` (text, 4 rows, max 500 chars)
- `image` (image with hotspot)

**Compatibility fieldset** (collapsible):

- `goodWithKids` (boolean, default false)
- `goodWithDogs` (boolean, default false)
- `goodWithCats` (boolean, default false)

**Health & Care fieldset** (collapsible):

- `spayedNeutered` (boolean, default false)
- `vaccinated` (boolean, default false)
- `houseTrained` (boolean, default false)
- `crateTrained` (boolean, default false)
- `microchipped` (boolean, default false)
- `specialNeeds` (text, 3 rows)

**Appearance & Behavior fieldset** (collapsible):

- `coatLength` (string, radio: short/medium/long)
- `color` (string, dropdown: black/white/brown/golden/tan/red/gray/brindle/spotted/merle/bi-color/tri-color)
- `hypoallergenic` (boolean, default false)
- `barking` (string, radio: low/moderate/high, label "Barking Level")

**Shelter Info fieldset** (collapsible):

- `dateArrivedAtShelter` (date)
