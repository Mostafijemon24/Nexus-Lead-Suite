export type ContainerNode = {
  t: "container";
  classes: string[];
  dir: "row" | "column";
  wrap?: boolean;
  width?: number;
  widthTablet?: number;
  widthMobile?: number;
  boxed?: boolean;
  bg?: string;
  align?: string;
  justify?: string;
  children: ContentNode[];
};
export type HeadingNode = { t: "heading"; level: string; text: string; href?: string; align?: string; classes: string[] };
export type TextNode = { t: "text"; html: string; align?: string; classes: string[] };
export type ListNode = { t: "list"; items: { text: string; icon?: string; href?: string }[]; classes: string[] };
export type ButtonNode = { t: "button"; text: string; href: string; style: "primary" | "ghost" | "link"; icon?: string; classes: string[] };
export type ImageNode = { t: "image"; src: string; alt: string; width: number; height: number; href?: string; displayWidth?: number; classes: string[] };
export type IconNode = { t: "icon"; icon: string; classes: string[] };
export type IconBoxNode = { t: "iconBox"; icon: string; title: string; desc: string; classes: string[] };
export type AccordionNode = { t: "accordion"; items: { q: string; a: string }[]; classes: string[] };
export type GalleryNode = { t: "gallery"; images: { src: string; alt: string; width: number; height: number }[]; cols: number; classes: string[] };
export type BadgeNode = { t: "badge"; strong: string; text: string; classes: string[] };
export type MapNode = { t: "map"; classes: string[] };
export type FormField = { id: string; type: string; label: string; placeholder: string; required: boolean; width: number; options?: string[] };
export type FormNode = { t: "form"; name: string; fields: FormField[]; button: string; success: string; classes: string[] };
export type PostsNode = { t: "posts"; classes: string[] };
export type DividerNode = { t: "divider"; classes: string[] };

export type ContentNode =
  | ContainerNode
  | HeadingNode
  | TextNode
  | ListNode
  | ButtonNode
  | ImageNode
  | IconNode
  | IconBoxNode
  | AccordionNode
  | GalleryNode
  | BadgeNode
  | MapNode
  | FormNode
  | PostsNode
  | DividerNode;

export type SectionVariant =
  | "hero"
  | "trust"
  | "cards"
  | "split"
  | "steps"
  | "faq"
  | "cta"
  | "table"
  | "text"
  | "gallery"
  | "blogIndex"
  | "postTop"
  | "postBottom"
  | "consultationForm"
  | "formSection"
  | "generic";

export type Section = {
  id: string;
  classes: string[];
  bg: "ink" | "white" | "soft" | "cream";
  variant: SectionVariant;
  children: ContentNode[];
};

export type FaqItem = { q: string; a: string };

export type ImageRef = { src: string; alt: string; width: number; height: number };

export type PageSeo = { title: string; description: string; focusKeyword: string; canonical: string };

export type PageDoc = {
  id: number;
  type: "page" | "post";
  slug: string;
  url: string;
  title: string;
  seo: PageSeo;
  featuredImage: ImageRef | null;
  date: string;
  modified: string;
  template: "lda" | "la";
  sections: Section[];
  faq: FaqItem[];
  wordCount: number;
};

export type PostDoc = {
  id: number;
  type: "post";
  slug: string;
  url: string;
  title: string;
  seo: PageSeo;
  featuredImage: ImageRef | null;
  date: string;
  modified: string;
  template: "post";
  html: string;
  toc: { id: string; text: string }[];
  excerpt: string;
  wordCount: number;
};

export type ElementorPostDoc = PageDoc & { type: "post" };

export type AnyDoc = PageDoc | PostDoc;
