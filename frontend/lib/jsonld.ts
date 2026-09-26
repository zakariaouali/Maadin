/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 *
 * Plain JSON.stringify is NOT safe there: a product name or description
 * containing "</script><script>…" would close the tag and run as code on
 * every visitor's browser. Escaping <, > and & (plus the two JS line
 * separators) keeps the JSON identical for crawlers while making it inert.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}
