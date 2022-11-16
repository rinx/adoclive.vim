import { Renderer } from "./renderer.ts";

export class PlainRenderer implements Renderer {
  render(body: string): string {
    return body;
  }
}
