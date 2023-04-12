import { isFullBlock, isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";

async function getContent(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  let para = "";
  response.results.map((result) => {
    if (isFullBlock(result)) {
      if (
        result.type === "paragraph" &&
        result.paragraph.rich_text[0]?.type === "text"
      ) {
        para += result.paragraph.rich_text[0].text.content + "\n";
      }
    }
  });

  return para;
}

export async function getContentFromSlug(slug: string) {
  let title = "";
  let content = null;
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
    content = getContent(response.results[0].id);
    if ("title" in response.results[0].properties.Title) {
      title = response.results[0].properties.Title.title[0].plain_text;
    }
  }

  return [title, content];
}
