import { client } from "@/sanity/client";
import { ALL_DOGS_QUERY } from "@/sanity/lib/queries";
import { ChatInterface } from "@/components/ChatInterface";
import type { Dog } from "@/lib/types";

async function getDogs(): Promise<Dog[]> {
  "use cache";
  return client.fetch(ALL_DOGS_QUERY);
}

export default async function HomePage() {
  const dogs = await getDogs();
  return <ChatInterface initialDogs={dogs} />;
}
