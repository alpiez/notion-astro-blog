import { isFullBlock, isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";
import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";

type Card =
  | {
      title: string;
      cover?: string;
      date: Date;
      tagName: string;
      tagColor: string;
      intro: string;
      slug: string | null;
    }
  | undefined;

export type Content = { result: BlockObjectResponse; childrenLevel: number };

export interface NotionResult {
  card: Card;
  contents: Content[];
}

async function getAllBlocks(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  return response;
}

async function addToContents(
  response: ListBlockChildrenResponse,
  childrenLevel = 0
) {
  const contents: Content[] = [];

  for (const result of response.results) {
    if (isFullBlock(result)) {
      let i = childrenLevel;
      contents.push({ result, childrenLevel: i });
      if (result.has_children) {
        contents.push(
          ...(await addToContents(await getAllBlocks(result.id), ++i))
        );
      }
    }
  }

  return contents;
}

// TODO: pretty slow though

export async function searchPageWithSlug(slug: string) {
  let card: Card;
  let contents: Content[] = [];
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
    contents = await addToContents(await getAllBlocks(res.id));
    if (
      "title" in res.properties.Title &&
      res.cover?.type == "external" &&
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
        cover: res.cover.external.url,
        date: new Date(res.created_time),
        tagName: res.properties.Tags.multi_select[0].name,
        tagColor: res.properties.Tags.multi_select[0].color,
        intro: res.properties.Intro.rich_text[0].plain_text,
        slug: res.properties.Slug.formula.string,
      };
    }
  }

  return { card, contents } as NotionResult;
}
