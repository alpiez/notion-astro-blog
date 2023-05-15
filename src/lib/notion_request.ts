import { isFullBlock, isFullPage } from "@notionhq/client";
import { notion, databaseId } from "./common_var";
import type {
  BlockObjectResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionBlock, Card, NotionResult, NotionText } from "./types";
import katex from "katex";

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
      notionBlock.text = loopText(result.paragraph.rich_text);
      break;
    case "heading_1":
      notionBlock.type = "heading_1";
      notionBlock.text = loopText(result.heading_1.rich_text);
      break;
    case "heading_2":
      notionBlock.type = "heading_2";
      notionBlock.text = loopText(result.heading_2.rich_text);
      break;
    case "heading_3":
      notionBlock.type = "heading_3";
      notionBlock.text = loopText(result.heading_3.rich_text);
      break;
    case "bulleted_list_item":
      notionBlock.type = "bulleted_list_item";
      notionBlock.text = loopText(result.bulleted_list_item.rich_text);
      break;
    case "numbered_list_item":
      notionBlock.type = "numbered_list_item";
      notionBlock.text = loopText(result.numbered_list_item.rich_text);
      break;
    case "toggle":
      notionBlock.type = "toggle";
      notionBlock.text = loopText(result.toggle.rich_text);
      break;
    case "quote":
      notionBlock.type = "quote";
      notionBlock.text = loopText(result.quote.rich_text);
      break;
    case "callout":
      notionBlock.type = "callout";
      notionBlock.text = loopText(result.callout.rich_text);
      notionBlock.options = {
        icon: result.callout.icon,
      };
      break;
    case "code":
      notionBlock.type = "code";
      notionBlock.text = loopText(result.code.rich_text);
      notionBlock.options = {
        language: result.code.language,
      };
      break;
    case "image":
      notionBlock.type = "image";
      notionBlock.text = loopText(result.image.caption);
      notionBlock.options = {
        url:
          result.image.type == "file"
            ? result.image.file.url
            : result.image.external.url,
      };
      break;
    case "equation":
      notionBlock.type = "equation";
      notionBlock.text = result.equation.expression;
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

function loopText(texts: Array<NotionText>) {
  let htmlString = "";
  let textHolder = "";

  for (const text of texts) {
    textHolder = "";
    if (text.href != null) {
      textHolder = `<a href="${text.href}" class="underline">${text.plain_text}</a>`;
    } else if (text.type === "equation") {
      textHolder = katex.renderToString(text.plain_text, {
        //https://katex.org/docs/options.html
        throwOnError: false,
        output: "mathml",
      });
    } else {
      textHolder = text.plain_text;
    }

    if (text.annotations.bold === true) {
      textHolder = `<b>${textHolder}</b>`;
    }
    if (text.annotations.italic === true) {
      textHolder = `<i>${textHolder}</i>`;
    }
    if (text.annotations.strikethrough === true) {
      textHolder = `<del>${textHolder}</del>`;
    }
    if (text.annotations.underline === true) {
      textHolder = `<ins>${textHolder}</ins>`;
    }
    if (text.annotations.code === true) {
      textHolder = `<code>${textHolder}</code>`;
    }
    if (text.annotations.color !== "default") {
      textHolder = textColorFormat(textHolder, text.annotations.color);
    }

    htmlString += textHolder;
  }

  return htmlString;
}

function textColorFormat(text: string, color: string) {
  const arr = color.split("_");
  let colorStyle = "";
  switch (arr[0]) {
    case "gray":
      colorStyle = "#A4A4A4";
      break;
    case "brown":
      colorStyle = "#B4816C";
      break;
    case "orange":
      colorStyle = "#E88C59";
      break;
    case "yellow":
      colorStyle = "#F5D06F";
      break;
    case "green":
      colorStyle = "#9DCE77";
      break;
    case "blue":
      colorStyle = "#5BB4E5";
      break;
    case "purple":
      colorStyle = "#B383DA";
      break;
    case "pink":
      colorStyle = "#EE86D1";
      break;
    case "red":
      colorStyle = "#F47575";
      break;
    default:
      colorStyle = "#D9D9D9";
      break;
  }

  if (arr[1] == "background") {
    text = `<mark style="background: ${colorStyle}">${text}</mark>`;
    return text;
  }
  text = `<span style="color: ${colorStyle}">${text}</span>`;
  return text;
}
