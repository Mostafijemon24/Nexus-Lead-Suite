import Link from "next/link";

export type Crumb = { name: string; url: string };

export default function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="Breadcrumb" className={`crumbs${light ? " crumbs--light" : ""}`}>
      <ol>
        {items.map((c, i) => (
          <li key={c.url}>
            {i < items.length - 1 ? <Link href={c.url}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
