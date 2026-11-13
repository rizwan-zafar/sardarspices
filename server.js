import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || process.env.HOSTNAME || "127.0.0.1";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, hostname, () => {
      console.log(`Sardar Store ready on ${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Sardar Store server:", error);
    process.exit(1);
  });
