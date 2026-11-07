import { getAllPosts } from "@/lib/content";
import PostCard from "./PostCard";

export default function BlogIndex({ limit }: { limit?: number }) {
  const posts = getAllPosts().slice(0, limit ?? 999);
  return (
    <ul className="post-grid">
      {posts.map((p) => (
        <li key={p.slug}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );
}
