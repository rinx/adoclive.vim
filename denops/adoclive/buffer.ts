import { autocmd, Denops } from "./deps.ts";
import { initByFileType, Renderer } from "./renderer/mod.ts";

export class Buffer {
  private denops: Denops;
  private bufnr: number;
  private renderer: Renderer;
  private _name = "";

  constructor(denops: Denops, bufnr: number, bufft: string) {
    this.denops = denops;
    this.bufnr = bufnr;

    this.renderer = initByFileType(bufft);

    this.init();
  }

  private async init() {
    this._name = await this.denops.call("expand", "%:t") as string;
    this.registerAutocmds();
  }

  async html(): Promise<string> {
    const buf = await this.denops.call(
      "getbufline",
      this.bufnr,
      1,
      "$",
    ) as string[];

    return Promise.resolve(this.renderer.render(buf.join("\n")));
  }

  get name(): string {
    return this._name;
  }

  close() {
    this.unregisterAutocmds();
  }

  private registerAutocmds() {
    autocmd.group(
      this.denops,
      `${this.denops.name}-${this.bufnr}`,
      (helper) => {
        helper.define(
          ["TextChanged", "TextChangedI", "TextChangedP"],
          "<buffer>",
          `call denops#notify('${this.denops.name}', 'sync', [])`,
        );
      },
    );
  }

  private unregisterAutocmds() {
    autocmd.group(
      this.denops,
      `${this.denops.name}-${this.bufnr}`,
      (helper) => {
        helper.remove("*", "<buffer>");
      },
    );
  }
}
