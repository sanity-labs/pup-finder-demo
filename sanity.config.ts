import {
  AGENT_CONTEXT_SCHEMA_TYPE_NAME,
  agentContextPlugin,
} from "@sanity/agent-context/studio";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import {
  type ListItemBuilder,
  structureTool,
} from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Pup Finder",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) => {
        const agentTypes = [AGENT_CONTEXT_SCHEMA_TYPE_NAME];
        const defaultListItems = S.documentTypeListItems().filter(
          (item: ListItemBuilder) => !agentTypes.includes(item.getId() ?? "")
        );
        return S.list()
          .title("Content")
          .items([
            ...defaultListItems,
            S.divider(),
            S.listItem()
              .title("Agents")
              .child(
                S.list()
                  .title("Agents")
                  .items([
                    S.documentTypeListItem(
                      AGENT_CONTEXT_SCHEMA_TYPE_NAME
                    ).title("Agent Contexts"),
                  ])
              ),
          ]);
      },
    }),
    visionTool(),
    agentContextPlugin(),
  ],
  schema: {
    types: schemaTypes,
  },
});
