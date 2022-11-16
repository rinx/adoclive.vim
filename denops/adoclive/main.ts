import { Denops, open, vars } from "./deps.ts";
import { Server } from "./server.ts";

export async function main(denops: Denops): Promise<void> {
  const server = new Server(denops);

  denops.dispatcher = {
    async start(): Promise<void> {
      if (server.running) {
        server.close();
      }

      const host = (await vars.g.get(denops, "adoclive#server_host") ||
        "127.0.0.1") as string;
      const port = (await vars.g.get(denops, "adoclive#server_port") ||
        0) as number;
      const open_browser = (await vars.g.get(denops, "adoclive#open_browser") ||
        true) as boolean;

      server.start(host, port);

      if (open_browser) {
        await open(`http://${server.host}:${server.port}`, {
          background: true,
        });
      }
    },
    close(): Promise<void> {
      server.close();
      return Promise.resolve();
    },
    status(): Promise<string> {
      if (server.running) {
        return Promise.resolve("running");
      }

      return Promise.resolve("stopped");
    },
    addr(): Promise<string> {
      if (server.running) {
        return Promise.resolve(`http://${server.host}:${server.port}`);
      }
      return Promise.resolve("");
    },
    sync(): Promise<void> {
      return server.sendBuffer();
    },
  };
}
