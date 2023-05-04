import { isFullBlock, isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";
import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionBlock, Card, NotionResult } from "./types";

async function getAllBlocks(pageId: string) {
  const response = await notion.blocks.children.list({
    block_id: pageId,
    page_size: 50,
  });

  return response;
}

function resultFormat(result: BlockObjectResponse) {
  const notionBlock: NotionBlock = {
    text: "",
    type: "",
    children: [],
    children_level: 0,
    options: null,
  };

  switch (result.type) {
    case "paragraph":
      notionBlock.type = "paragraph";
      if (result.paragraph.rich_text[0]?.type == "text")
        notionBlock.text = result.paragraph.rich_text[0].text.content;
      break;
    case "heading_1":
      notionBlock.type = "heading_1";
      if (result.heading_1.rich_text[0]?.type == "text")
        notionBlock.text = result.heading_1.rich_text[0].text.content;
      break;
    case "heading_2":
      notionBlock.type = "heading_2";
      if (result.heading_2.rich_text[0]?.type == "text")
        notionBlock.text = result.heading_2.rich_text[0].text.content;
      break;
    case "heading_3":
      notionBlock.type = "heading_3";
      if (result.heading_3.rich_text[0]?.type == "text")
        notionBlock.text = result.heading_3.rich_text[0].text.content;
      break;
    case "bulleted_list_item":
      notionBlock.type = "bulleted_list_item";
      if (result.bulleted_list_item.rich_text[0]?.type == "text")
        notionBlock.text = result.bulleted_list_item.rich_text[0].text.content;
      break;
    case "numbered_list_item":
      notionBlock.type = "numbered_list_item";
      if (result.numbered_list_item.rich_text[0]?.type == "text")
        notionBlock.text = result.numbered_list_item.rich_text[0].text.content;
      break;
    case "toggle":
      notionBlock.type = "toggle";
      if (result.toggle.rich_text[0]?.type == "text")
        notionBlock.text = result.toggle.rich_text[0].text.content;
      break;
    case "quote":
      notionBlock.type = "quote";
      if (result.quote.rich_text[0]?.type == "text")
        notionBlock.text = result.quote.rich_text[0].text.content;
      break;
    case "callout":
      notionBlock.type = "callout";
      if (result.callout.rich_text[0]?.type == "text")
        notionBlock.text = result.callout.rich_text[0].text.content;
      notionBlock.options = {
        icon: result.callout.icon,
      };
      break;
    case "code":
      notionBlock.type = "code";
      if (result.code.rich_text[0]?.type == "text")
        notionBlock.text = result.code.rich_text[0].text.content;
      notionBlock.options = {
        language: result.code.language,
      };
      break;
    case "image":
      notionBlock.type = "image";
      if (result.image.caption[0]?.type == "text")
        notionBlock.text = result.image.caption[0].text.content;
      notionBlock.options = {
        url:
          result.image.type == "file"
            ? result.image.file.url
            : result.image.external.url,
      };
      break;
    default:
      break;
  }

  notionBlock.type = result.type;
  return notionBlock;
}

// Convert Notion's response into array of NotionBlock objects.
async function addToContents(
  response: ListBlockChildrenResponse,
  childLvl = 0
) {
  const notionBlocks: NotionBlock[] = [];
  let notionBlock: NotionBlock = {
    text: "",
    type: "",
    children: [],
    children_level: 0,
    options: null,
  };

  for (const result of response.results) {
    if (isFullBlock(result)) {
      notionBlock = resultFormat(result);
      notionBlock.children_level = childLvl;

      if (result.has_children) {
        notionBlock.children.push(
          ...(await addToContents(await getAllBlocks(result.id), childLvl + 1))
        );
      }

      notionBlocks.push(notionBlock);
    }
  }
  return notionBlocks;
}

// TODO: pretty slow though

export async function searchPageWithSlug(slug: string) {
  let card: Card;
  let blocks: NotionBlock[] = [];
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
    blocks = await addToContents(await getAllBlocks(res.id));
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

  return { card, blocks } as NotionResult;
}
