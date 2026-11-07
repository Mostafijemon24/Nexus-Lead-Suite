import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getDoc } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import PageTemplate from "@/components/templates/PageTemplate";
import PostTemplate from "@/components/templates/PostTemplate";
import type { PageDoc } from "@/types/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug: [slug] }));
}

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug.join("/"));
  if (!doc) return {};
  return buildMetadata(doc);
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDoc(slug.join("/"));
  if (!doc) notFound();
  if (doc.type === "post") return <PostTemplate doc={doc} />;
  return <PageTemplate doc={doc as PageDoc} />;
}
