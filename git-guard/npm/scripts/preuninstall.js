#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SENTINEL_START = "# >>> Git-guard by Sulaiman Misri >>>";
const SENTINEL_END = "# <<< Git-guard <<<";

const platform = os.platform();
const home = os.homedir();

function detectShell() {
  if (platform === "win32") return "powershell";
  const shellPath = process.env.SHELL || "";
  if (shellPath.endsWith("zsh")) return "zsh";
  if (shellPath.endsWith("bash")) return "bash";
  return "bash";
}

function getRcFilePath(shellType) {
  if (shellType === "powershell") {
    return path.join(
      home,
      "Documents",
      "WindowsPowerShell",
      "Microsoft.PowerShell_profile.ps1"
    );
  }
  if (shellType === "zsh") return path.join(home, ".zshrc");
  return path.join(home, ".bashrc");
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function printReloadInstructions(shellType) {
  console.log("");
  if (shellType === "powershell") {
    console.log("[git-guard] Reload your shell with: . $PROFILE");
  } else if (shellType === "zsh") {
    console.log("[git-guard] Reload your shell with: exec zsh");
  } else {
    console.log("[git-guard] Reload your shell with: source ~/.bashrc");
  }
  console.log("");
}

function main() {
  const shellType = detectShell();
  const rcFilePath = getRcFilePath(shellType);

  const rcContent = readFileSafe(rcFilePath);
  if (!rcContent) return;

  const startIdx = rcContent.indexOf(SENTINEL_START);
  if (startIdx === -1) return;

  const endIdx = rcContent.indexOf(SENTINEL_END, startIdx);
  if (endIdx === -1) return;

  let before = rcContent.slice(0, startIdx);
  let after = rcContent.slice(endIdx + SENTINEL_END.length);

  before = before.replace(/\n+$/, "");
  after = after.replace(/^\n+/, "");

  fs.writeFileSync(rcFilePath, before + "\n" + after, "utf8");

  console.log("");
  console.log(`[git-guard] Successfully removed wrapper from ${rcFilePath}`);
  printReloadInstructions(shellType);
}

main();
