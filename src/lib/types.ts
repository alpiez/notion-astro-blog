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

export type NotionBlock = {
  text: string;
  type: string;
  children: Array<NotionBlock>;
  children_level: number;
};

export interface NotionResult {
  card: Card;
  blocks: NotionBlock[];
}
