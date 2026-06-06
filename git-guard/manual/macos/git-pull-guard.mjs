import { execSync, spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const cleanArgs = args.filter((arg) => arg !== "--confirm");

const allowedBranch = process.env.GIT_GUARD_ALLOWED_BRANCH || "staging";
const [remote = "origin", targetBranch = allowedBranch, ...rest] = cleanArgs;

function run(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function isGitRepo() {
  try {
    run("git rev-parse --git-dir");
    return { ok: true };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ok: false, reason: "git-missing" };
    }
    return { ok: false, reason: "not-a-repo" };
  }
}

function getCurrentBranch() {
  try {
    const branch = run("git branch --show-current");
    if (branch) return branch;
  } catch (err) {
    if (process.env.GIT_GUARD_DEBUG)
      console.error("[DEBUG] git branch --show-current:", err.message);
  }

  try {
    const branch = run("git rev-parse --abbrev-ref HEAD");
    if (branch) return branch;
  } catch (err) {
    if (process.env.GIT_GUARD_DEBUG)
      console.error("[DEBUG] git rev-parse --abbrev-ref HEAD:", err.message);
  }

  return "";
}

function buildGuardScriptPath() {
  try {
    const fileUrl = import.meta.url;
    if (fileUrl.startsWith("file://")) {
      return fileUrl.slice(7);
    }
  } catch (err) {
    if (process.env.GIT_GUARD_DEBUG)
      console.error("[DEBUG] import.meta.url:", err.message);
  }
  return "~/.git-guard/git-pull-guard.mjs";
}

function buildConfirmCommand() {
  const extra = rest.length ? ` ${rest.join(" ")}` : "";
  return `git pull ${remote} ${targetBranch}${extra} --confirm`;
}

try {
  const repoCheck = isGitRepo();
  if (!repoCheck.ok) {
    if (repoCheck.reason === "git-missing") {
      fail(
        "[ERROR] Git is not installed or not in PATH. Git Guard requires Git to function.",
      );
    }
    fail(
      "[ERROR] Not inside a Git repository. Please navigate to a git repository and try again.",
    );
  }

  const currentBranch = getCurrentBranch();

  if (!currentBranch || currentBranch === "HEAD") {
    fail(
      "[ERROR] Cannot detect current branch. Repository may be in detached HEAD state.",
    );
  }

  const violations = [];

  if (currentBranch !== allowedBranch) {
    violations.push(
      `Current branch is '${currentBranch}', but this environment only allows '${allowedBranch}'.`,
    );
  }

  if (targetBranch !== allowedBranch) {
    let msg = `You are trying to pull '${targetBranch}', but only '${allowedBranch}' is allowed here.`;
    if (targetBranch !== currentBranch) {
      msg += ` Your current branch is '${currentBranch}'.`;
    }
    violations.push(msg);
  }

  if (violations.length > 0) {
    if (confirm) {
      console.warn("\n[WARNING] Bypassing violations via --confirm:\n");
      violations.forEach((msg, index) => {
        console.warn(`  ${index + 1}. ${msg}`);
      });
      console.warn("");
    } else {
      console.error("\n[BLOCKED] Unsafe git pull detected.\n");
      violations.forEach((msg, index) => {
        console.error(`${index + 1}. ${msg}`);
      });

      console.error(
        `\nIf you confirm to fetch/pull this branch, please run:\n${buildConfirmCommand()}\n`,
      );
      process.exit(1);
    }
  }

  console.log(`[INFO] Current branch : ${currentBranch}`);
  console.log(`[INFO] Target branch  : ${targetBranch}`);
  console.log(`[INFO] Remote         : ${remote}`);
  console.log(`[INFO] Confirm mode   : ${confirm ? "YES" : "NO"}`);
  console.log("");

  const result = spawnSync("git", ["pull", remote, targetBranch, ...rest], {
    stdio: "inherit",
  });

  if (result.error) {
    fail(`[ERROR] Failed to spawn git process: ${result.error.message}`);
  }

  process.exit(result.status ?? 1);
} catch (err) {
  console.error(`[FATAL] An unexpected error occurred in Git Guard:`);
  console.error(err.message || err);

  const guardPath = buildGuardScriptPath();
  console.error(
    `\nIf this error persists, try reinstalling Git Guard:\n  1. Delete the guard script: rm ${guardPath}\n  2. Recreate it following the installation guide.`,
  );

  process.exit(1);
}
