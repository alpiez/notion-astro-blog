import { isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

async function getContent(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  return response;
}

export async function getContentFromSlug(slug: string) {
  let title = "";
  let content: ListBlockChildrenResponse | undefined;
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: "Created",
        direction: "ascending",
      },
    ],
    filter: {
      property: "Slug",
      formula: {
        string: {
          contains: slug,
        },
      },
    },
  });

  if (isFullPage(response.results[0])) {
    content = await getContent(response.results[0].id);
    if ("title" in response.results[0].properties.Title) {
      title = response.results[0].properties.Title.title[0].plain_text;
    }
  }

  return [title, content];
}
