export type Card =
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

export type NotionText = {
  type: string;
  plain_text: string;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  href: string | null;
};

type NotionCalloutBlock = {
  icon:
    | {
        type: "emoji";
        emoji: string;
      }
    | {
        type: "external";
        external: {
          url: string;
        };
      }
    | {
        type: "file";
        file: {
          url: string;
        };
      }
    | null;
};

type NotionCodeBlock = {
  language: string;
};

type NotionImage = {
  url: string;
};

export type NotionBlock = {
  text: string;
  type: string;
  children: Array<NotionBlock>;
  children_level: number;
  options: null | NotionCalloutBlock | NotionCodeBlock | NotionImage;
};

export interface NotionResult {
  card: Card;
  blocks: NotionBlock[];
}
