// Stdio MCP client for OpenScreen: node osmcp.mjs list | call <tool> '<json args>' | read <resourceUri>
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const [cmd, a, b] = process.argv.slice(2);
const client = new Client({ name: "osmcp", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "/Applications/Openscreen.app/Contents/MacOS/Openscreen", args: ["mcp"] }));
try {
  let out;
  if (cmd === "list") out = (await client.listTools()).tools;
  // transcribe and exportVideo run for minutes: allow 30 min, reset on progress.
  else if (cmd === "call") out = await client.callTool({ name: a, arguments: b ? JSON.parse(b) : {} }, undefined, { timeout: 1800000, resetTimeoutOnProgress: true });
  else if (cmd === "read") out = await client.readResource({ uri: a });
  else throw new Error("usage: list | call <tool> '<json>' | read <uri>");
  console.log(JSON.stringify(out, null, 2));
} catch (e) { console.error("ERROR:", e.message); process.exitCode = 1; }
finally { await client.close().catch(() => {}); }
