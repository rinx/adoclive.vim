import { markdown } from "../deps.ts";
import { Renderer } from "./renderer.ts";

export class MarkdownRenderer implements Renderer {
  render(body: string): string {
    const parsed = markdown.Marked.parse(body);

    return parsed.content;
  }
}
