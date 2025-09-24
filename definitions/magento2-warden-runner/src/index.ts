import { Container, getContainer } from "@cloudflare/containers";

export class MagentoContainer extends Container {
  defaultPort = 80;
  sleepAfter = "15m";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session") || "dev";
    const instance = getContainer(env.MAGENTO_CONTAINER, sessionId);
    return instance.fetch(request);
  }
};

type Env = {
  MAGENTO_CONTAINER: unknown;
};
