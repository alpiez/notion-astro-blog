import { isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";

type Card =
  | {
      title: string;
      tagName: string;
      tagColor: string;
      intro: string;
      slug: string | null;
    }
  | undefined;

type Content = ListBlockChildrenResponse | undefined;

export interface NotionResult {
  card: Card;
  content: Content;
}

async function getContent(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  return response;
}

export async function searchPageWithSlug(slug: string) {
  let card: Card;
  let content: Content;
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

  const res = response.results[0];

  if (isFullPage(res)) {
    content = await getContent(res.id);
    if (
      "title" in res.properties.Title &&
      "multi_select" in res.properties.Tags &&
      "rich_text" in res.properties.Intro &&
      "formula" in res.properties.Slug &&
      "string" in res.properties.Slug.formula &&
      (res.properties.Title.title.length &&
        res.properties.Tags.multi_select.length &&
        res.properties.Intro.rich_text.length) != 0
    ) {
      card = await {
        title: res.properties.Title.title[0].plain_text,
        tagName: res.properties.Tags.multi_select[0].name,
        tagColor: res.properties.Tags.multi_select[0].color,
        intro: res.properties.Intro.rich_text[0].plain_text,
        slug: res.properties.Slug.formula.string,
      };
    }
  }

  return { card, content } as NotionResult;
}
