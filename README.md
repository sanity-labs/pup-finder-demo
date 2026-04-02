# Pup Finder 🐕

An AI-powered dog adoption app that replaces rigid search filters with a single question: **"Describe your perfect dog."**

Built with [Next.js](https://nextjs.org/), [Sanity](https://www.sanity.io/), and [Sanity Agent Context](https://www.sanity.io/docs/ai/agent-context). And yes, there's confetti.

<video src="https://github.com/user-attachments/assets/8a285f81-5960-4ab2-834c-238c2110795f" controls autoplay loop muted width="600"></video>

## What it does

Traditional shelter sites make you search like a database admin: size dropdown, breed checkbox, age slider. Nobody actually thinks that way. You think *"I need a chill dog that won't chase my cats and doesn't make me sneeze."*

Pup Finder lets users type exactly that. AI reads the structured dog data in Sanity, maps natural language to real fields (`hypoallergenic`, `goodWithCats`, `energyLevel`), and returns dogs that actually match — with a friendly explanation of *why* each dog is a good fit.

### The flow

1. **Browse** — A grid of all available dogs loads on the home page (fetched directly via GROQ, no AI overhead)
2. **Describe** — Type what you're looking for in plain language
3. **Match** — AI filters the dogs and explains its reasoning
4. **Narrow down** — If 4+ dogs match, the AI asks one round of follow-up questions based on what actually varies among the remaining dogs
5. **Choose** — Pick your dog. Get confetti. Feel feelings.

## Why Agent Context instead of RAG

Most AI search follows the RAG playbook: dump content into a vector database as flat text, then do similarity search. That works for matching a question to a help article. It falls apart when your data has real structure.

A dog isn't a paragraph. It has a `temperament` field set to `"calm"`, a `goodWithCats` boolean, a `hypoallergenic` flag. These are discrete, queryable facts — not text to fuzzy-match against.

[Agent Context](https://www.sanity.io/docs/ai/agent-context) gives AI agents schema-aware, read-only access to your Sanity dataset. The agent understands your data shape, writes its own GROQ queries, and matches against real constraints. Structured queries where it matters, semantic understanding where it helps.

## Tech stack

| What | Why |
|------|-----|
| [Next.js 16](https://nextjs.org/) (App Router) | React framework with server components |
| [Sanity](https://www.sanity.io/) | Structured content — dog profiles with 30+ fields |
| [Sanity Agent Context](https://www.sanity.io/docs/ai/agent-context) | MCP server that gives AI schema-aware access to the dataset |
| [next-sanity](https://github.com/sanity-io/next-sanity) | Sanity client, image URLs, embedded Studio |
| [Vercel AI SDK](https://ai-sdk.dev/) | Streaming AI responses with MCP tool support |
| [Anthropic Claude](https://www.anthropic.com/) | LLM for the matching (swap in any provider) |
| [Tailwind CSS](https://tailwindcss.com/) | Bold, maximalist styling |
| [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | The most important dependency |

## Getting started

### Installing the template

#### 1. Initialize template with Sanity CLI

Run this command in your terminal to initialize the template on your local machine. It will set up a new Sanity project, configure your dataset, and install dependencies.

```shell
npm create sanity@latest -- --template sanity-labs/pup-finder-demo
```

#### 2. Import sample data (optional)

The template comes with 62 dogs ready to go — all breeds, temperaments, and adorable AI-generated photos included. Run this from the project root:

```shell
npm run import-sample-data
```

#### 3. Configure your API keys

The CLI sets up your Sanity project and tokens automatically. You still need to add your LLM API key. Open `.env.local` and fill in:

| Variable | What it is |
|----------|------------|
| `ANTHROPIC_API_KEY` | Your [Anthropic API key](https://console.anthropic.com/) (or swap in another provider) |

The `SANITY_CONTEXT_MCP_URL` will be configured in step 5 after you set up Agent Context in the Studio.

#### 4. Run the app locally

Navigate to your project directory and start the development server:

```shell
npm run dev
```

Open the app at [http://localhost:3000](http://localhost:3000). The embedded Sanity Studio is at [http://localhost:3000/studio](http://localhost:3000/studio) — sign in with the same account you used for the CLI.

#### 5. Configure Agent Context

This is the part that makes the AI matching work. In the Studio, navigate to **Agents > Agent Contexts**.

**If you imported the sample data:** An Agent Context document is already there. Open it and copy the MCP URL shown at the top of the document into your `.env.local` as `SANITY_CONTEXT_MCP_URL`, then restart the dev server.

**If you're starting fresh:** Create a new context document:

- Scope it to the `dog` document type
- Add any instructions for how the AI should behave (tone, constraints, etc.)
- Publish the document

Copy the MCP URL into your `.env.local` as `SANITY_CONTEXT_MCP_URL` and restart the dev server.

#### 6. Deploy Sanity Studio

When you're ready to go live with content editing:

```shell
npx sanity deploy --external
```

The `--external` flag is required because the Studio is embedded in the Next.js app.

## Project structure

```
src/
├── app/
│   ├── api/chat/        # AI matching endpoint (Vercel AI SDK + Agent Context)
│   ├── studio/          # Embedded Sanity Studio at /studio
│   ├── page.tsx         # Home page — dog grid + search input
│   └── layout.tsx       # Root layout
├── components/
│   ├── ChatInterface    # Search + AI response flow
│   ├── DogCard          # Grid card with photo, name, breed
│   ├── DogGrid          # Responsive dog grid
│   ├── DogModal         # Detail modal with full dog info
│   ├── DogProfileCard   # Expanded profile view
│   ├── FollowUpPills    # Clickable follow-up question buttons
│   ├── SearchInput      # "Describe your perfect dog..." input
│   └── Confetti         # 🎉
├── sanity/
│   ├── schemaTypes/     # Dog schema definition
│   ├── client.ts        # Sanity client config
│   └── lib/queries.ts   # GROQ queries
└── lib/
    ├── types.ts         # TypeScript types
    └── colors.ts        # Per-dog color assignments
```

## The dog schema

Each dog document has 30+ fields organized into fieldsets: core info (name, breed, size, temperament), compatibility (kids, dogs, cats), health and care (vaccinated, house trained, special needs), appearance (coat length, color, hypoallergenic), and shelter info. Check [src/sanity/schemaTypes/dog.ts](src/sanity/schemaTypes/dog.ts) for the full definition.

## Beyond dogs

The pattern works anywhere you have structured content that people need to search through conversationally:

- **Real estate** — "3-bedroom with a yard, walkable to schools, under $400k"
- **E-commerce** — "Running shoes for flat feet that work on trails"
- **Job boards** — "Remote backend role, Rust or Go, series A startup"
- **Recipe sites** — "Quick weeknight dinner, no dairy, feeds four"

Structured data in Sanity + Agent Context as the bridge + AI that lets users search the way they actually think.

## How it was built

This project was built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) using the [Sanity MCP server](https://www.sanity.io/docs/ai/mcp-server) and [Sanity Skills](https://www.sanity.io/docs/ai/skills). The AI coding agent scaffolded the Next.js project, created the schema, generated 62 sample dogs with breed-accurate AI images, wired up Agent Context, and built the full UI — including the confetti, which is obviously the most important feature.

Read the full build walkthrough (coming soon).

## License

MIT
