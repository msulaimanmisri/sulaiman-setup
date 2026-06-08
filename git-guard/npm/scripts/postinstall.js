#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

function getWrapperTemplate(shellType) {
  if (shellType === "powershell") return "powershell.ps1";
  if (shellType === "zsh") return "zsh.env";
  return "bash.env";
}

function getTemplatePath(shellType) {
  const pkgDir = path.resolve(__dirname, "..");
  return path.join(pkgDir, "wrappers", getWrapperTemplate(shellType));
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function removeBlock(content) {
  const startIdx = content.indexOf(SENTINEL_START);
  if (startIdx === -1) return { content, removed: false };

  const endIdx = content.indexOf(SENTINEL_END, startIdx);
  if (endIdx === -1) return { content, removed: false };

  let before = content.slice(0, startIdx);
  let after = content.slice(endIdx + SENTINEL_END.length);

  before = before.replace(/\n+$/, "");
  after = after.replace(/^\n+/, "");

  return { content: before + "\n" + after, removed: true };
}

function extractCustomBranch(content) {
  const lines = content.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(
      /^\s*\$?env:GIT_GUARD_ALLOWED_BRANCH\s*=\s*["']?(\S+?)["']?\s*$/i
    );
    if (match) return match[1];
    const match2 = lines[i].match(
      /^\s*export\s+GIT_GUARD_ALLOWED_BRANCH\s*=\s*(\S+?)(?:\s*#.*)?$/
    );
    if (match2) return match2[1];
  }
  return "";
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
  const templatePath = getTemplatePath(shellType);

  if (!fs.existsSync(templatePath)) {
    console.error(`[git-guard] ERROR: Wrapper template not found at ${templatePath}`);
    process.exit(1);
  }

  const template = readFileSafe(templatePath);

  const rcDir = path.dirname(rcFilePath);
  if (!fs.existsSync(rcDir)) {
    fs.mkdirSync(rcDir, { recursive: true });
  }

  let rcContent = readFileSafe(rcFilePath);

  const customBranch = extractCustomBranch(rcContent);

  const { content: cleaned, removed } = removeBlock(rcContent);

  let newContent = cleaned.replace(/\n+$/, "") + "\n\n" + template + "\n";

  if (customBranch && customBranch !== "staging") {
    if (shellType === "powershell") {
      newContent = newContent.replace(
        /^\$env:GIT_GUARD_ALLOWED_BRANCH\s*=\s*"staging"/m,
        `$env:GIT_GUARD_ALLOWED_BRANCH = "${customBranch}"`
      );
    } else {
      newContent = newContent.replace(
        /^export GIT_GUARD_ALLOWED_BRANCH=staging/m,
        `export GIT_GUARD_ALLOWED_BRANCH=${customBranch}`
      );
    }
  }

  fs.writeFileSync(rcFilePath, newContent, "utf8");

  console.log("");
  console.log(`[git-guard] Successfully injected wrapper into ${rcFilePath}`);
  if (removed) {
    console.log("[git-guard] Previous Git-guard block was replaced (upgrade).");
  }
  printReloadInstructions(shellType);
}

main();
