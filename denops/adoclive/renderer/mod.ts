import { Renderer } from "./renderer.ts";
import { AsciidocRenderer } from "./asciidoc.ts";
import { MarkdownRenderer } from "./markdown.ts";
import { PlainRenderer } from "./plain.ts";

export type { Renderer } from "./renderer.ts";

export function initByFileType(ft: string): Renderer {
  switch (ft.toLowerCase()) {
    case "asciidoc":
    case "adoc":
      return new AsciidocRenderer();
    case "markdown":
    case "md":
      return new MarkdownRenderer();
    default:
      return new PlainRenderer();
  }
}
