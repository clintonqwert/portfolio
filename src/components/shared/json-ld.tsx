/**
 * Structured data. The payload is built server-side from published content, so
 * there is no user input in it and no sanitisation concern.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
