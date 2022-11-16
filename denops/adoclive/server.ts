import { Denops, vars } from "./deps.ts";
import { Buffer } from "./buffer.ts";

export class Server {
  private denops: Denops;
  private _running: boolean;
  private listener: Deno.Listener | undefined;

  private sockets: Map<string, globalThis.WebSocket> = new Map<
    string,
    globalThis.WebSocket
  >();

  private client: string;
  private buffer: Buffer | undefined;

  constructor(denops: Denops) {
    this.denops = denops;
    this._running = false;

    this.client = Deno.readTextFileSync(
      new URL("./assets/client.html", import.meta.url),
    );
  }

  async start(host: string, port: number) {
    this.listener = Deno.listen({
      hostname: host,
      port: port,
    });

    this.buffer = new Buffer(
      this.denops,
      await this.denops.call("bufnr") as number,
      await vars.options.get(this.denops, "filetype") || "",
    );

    this.serve(this.listener);
    this._running = true;
  }

  close() {
    this._running = false;

    if (this.listener) {
      this.listener.close();
      this.listener = undefined;
    }

    if (this.buffer) {
      this.buffer.close();
    }

    this.sockets.forEach((s) => {
      if (s.readyState !== s.CLOSED) {
        s.send(JSON.stringify({ connect: "close" }));
      }

      s.close();
    });
    this.sockets.clear();
  }

  async sendBuffer() {
    if (this.buffer) {
      const html = await this.buffer.html();

      this.sockets.forEach((s) => {
        s.send(JSON.stringify({ html: html }));
      });
    }
  }

  get running(): boolean {
    return this._running;
  }

  get host(): string {
    if (this.listener == undefined) {
      return "undefined";
    }

    switch (this.listener.addr.transport) {
      case "tcp":
      case "udp":
        return this.listener.addr.hostname;
    }

    return "undefined";
  }

  get port(): number {
    if (this.listener == undefined) {
      return -1;
    }

    switch (this.listener.addr.transport) {
      case "tcp":
      case "udp":
        return this.listener.addr.port;
    }

    return -1;
  }

  private async serve(listener: Deno.Listener) {
    for await (const conn of listener) {
      this.handleHTTP(conn);
    }
  }

  private async handleHTTP(conn: Deno.Conn) {
    for await (const { request, respondWith } of Deno.serveHttp(conn)) {
      if (request.method == "GET") {
        switch (new URL(request.url).pathname) {
          case "/ws":
            respondWith(this.handleWS(request));
            break;
          default:
            respondWith(
              new Response(
                this.client,
                {
                  status: 200,
                  headers: new Headers({
                    "Content-Type": "text/html",
                  }),
                },
              ),
            );
            break;
        }
      } else {
        respondWith(
          new Response(
            "Not found",
            {
              status: 404,
              headers: new Headers({
                "Content-Type": "text/html",
              }),
            },
          ),
        );
      }
    }
  }

  private handleWS(request: Request): Response {
    const { socket, response } = Deno.upgradeWebSocket(request);
    const uuid = crypto.randomUUID();

    this.sockets.set(uuid, socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ bufname: this.buffer?.name }));
      this.sendBuffer();
    };

    socket.onclose = () => {
      this.sockets.delete(uuid);
    };

    socket.onmessage = (_) => {};

    return response;
  }
}
