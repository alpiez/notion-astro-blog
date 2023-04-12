import { Client } from "@notionhq/client";

export const notion = new Client({ auth: import.meta.env.SECRET_NOTION_KEY });
export const databaseId = import.meta.env.SECRET_NOTION_DATABASE_ID;
