import { asciidoctor } from "../deps.ts";
import { Renderer } from "./renderer.ts";

export class AsciidocRenderer implements Renderer {
  private adoc = asciidoctor.default();

  render(body: string): string {
    const html = this.adoc.convert(body);

    return html.toString();
  }
}
