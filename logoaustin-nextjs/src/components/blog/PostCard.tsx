import Link from "next/link";
import type { AnyDoc } from "@/types/content";
import SmartImage from "@/components/ui/SmartImage";
import { formatDate } from "@/lib/seo";
import { readingTime } from "@/lib/content";

export default function PostCard({ post }: { post: AnyDoc }) {
  const excerpt = "excerpt" in post && post.excerpt ? post.excerpt : post.seo.description;
  return (
    <article className="post-card">
      {post.featuredImage ? (
        <Link href={post.url} className="post-card__media" tabIndex={-1} aria-hidden="true">
          <SmartImage src={post.featuredImage.src} alt="" width={post.featuredImage.width} height={post.featuredImage.height} sizes="(max-width: 767px) 92vw, (max-width: 1279px) 45vw, 380px" />
        </Link>
      ) : null}
      <div className="post-card__body">
        <p className="post-card__meta">
          <time dateTime={post.date.slice(0, 10)}>{formatDate(post.date)}</time> · {readingTime(post.wordCount)}
        </p>
        <h3>
          <Link href={post.url}>{post.title}</Link>
        </h3>
        <p>{excerpt.length > 170 ? `${excerpt.slice(0, 167).trimEnd()}…` : excerpt}</p>
      </div>
    </article>
  );
}
