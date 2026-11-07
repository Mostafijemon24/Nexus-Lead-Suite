export default function Toc({ items }: { items: { id: string; text: string }[] }) {
  if (items.length < 3) return null;
  return (
    <nav className="toc" aria-labelledby="toc-title">
      <p id="toc-title" className="toc__title">
        In this article
      </p>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`}>{i.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
