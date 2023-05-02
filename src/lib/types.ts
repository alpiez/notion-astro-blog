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

export type NotionBlock = {
  text: string;
  type: string;
  children: Array<NotionBlock>;
  children_level: number;
  options: null | NotionCalloutBlock;
};

export interface NotionResult {
  card: Card;
  blocks: NotionBlock[];
}
