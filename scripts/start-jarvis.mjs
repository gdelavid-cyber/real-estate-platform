import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const jarvisDir = "C:\\Users\\Gojii\\Downloads\\jarvis-main\\jarvis-main";
const bridgeScript = resolve(jarvisDir, "bridge", "server.mjs");

if (!existsSync(bridgeScript)) {
  console.error(`[jarvis-launcher] Could not find Jarvis bridge server at ${bridgeScript}`);
  process.exit(1);
}

console.log("[jarvis-launcher] Starting Jarvis Claude Agent Bridge on port 8787...");
console.log(`[jarvis-launcher] Bridge Script: ${bridgeScript}`);

const env = {
  ...process.env,
  JARVIS_BRIDGE_PORT: "8787",
  JARVIS_ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000,https://real-estate-platform-eight-iota.vercel.app,https://real-estate-platform-newsintel.vercel.app",
  JARVIS_ALLOW_NO_ORIGIN: "1",
  JARVIS_ALLOW_WRITES: "1",
};

const child = spawn("node", [bridgeScript], {
  cwd: jarvisDir,
  env,
  stdio: "inherit",
  shell: true,
});

child.on("error", (err) => {
  console.error("[jarvis-launcher] Failed to start bridge:", err);
});

child.on("exit", (code) => {
  console.log(`[jarvis-launcher] Bridge process exited with code ${code}`);
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
