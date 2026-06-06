# Git-Guard NPM Package — Folder Architecture

**Plan:** Restructure repo into `manual/` and `npm/` top-level folders using Option B (method-first, shared npm core).

## Folder Structure

```
git-guard/
├── npm/                              # One package, auto-detects shell
│   ├── package.json                  # name: git-guard, bin: cli.js
│   ├── cli.js                        # Modified git-pull-guard.mjs + shebang
│   ├── scripts/
│   │   ├── postinstall.sh            # Detects zsh/bash, injects wrapper
│   │   └── preuninstall.sh           # Removes wrapper block from rc file
│   └── wrappers/
│       ├── zsh.env                   # zsh wrapper template with sentinel
│       └── bash.env                  # bash wrapper template with sentinel
├── manual/                           # Copy-paste for users who prefer it
│   ├── macos/
│   │   ├── zshrc.env
│   │   └── git-pull-guard.mjs
│   └── ubuntu/
│       ├── bashrc.env
│       └── git-pull-guard.mjs
├── readme.md
├── image.png
├── image-1.png
└── .gitignore
```

## What Changes

### `npm/cli.js` (from `git-pull-guard.mjs`)
- Add `#!/usr/bin/env node` shebang (enables direct execution as npm bin)
- Remove `buildGuardScriptPath()` function (script is in PATH, no ref needed)
- Change error message: `"Delete the guard script: rm ..."` → `"Uninstall package: npm uninstall -g git-guard"`
- Keep everything else identical

### `npm/wrappers/zsh.env` and `npm/wrappers/bash.env`
- Identical content (both override `git()` the same way)
- Add sentinel comments for idempotent injection/removal:
```sh
# >>> Git-guard by Sulaiman Misri >>>
export GIT_GUARD_ALLOWED_BRANCH=staging
git() {
  if [ "$1" = "pull" ]; then
    shift
    git-guard "$@"
    return $?
  fi
  command git "$@"
}
# <<< Git-guard <<<
```
- These files are templates used by `postinstall.sh` — they're not copied manually

### `npm/scripts/postinstall.sh`
1. Detect shell: check `$SHELL` env var (e.g. `/bin/zsh`, `/bin/bash`), fallback to `echo $SHELL`
2. Pick rc file: `~/.zshrc` for zsh, `~/.bashrc` for bash (error if unknown)
3. **Remove old block:** if sentinel `# >>> Git-guard by Sulaiman Misri >>>` exists, delete all lines between it and `# <<< Git-guard <<<` (inclusive). This handles upgrades cleanly.
4. **Preserve user's custom branch:** before injecting, check if an `export GIT_GUARD_ALLOWED_BRANCH=` exists outside the sentinel block. If found, copy that value and replace the default `staging` line in the wrapper template.
5. Append the wrapper template to the rc file
6. Print: `"git-guard installed. Reload with: exec zsh"` or `"source ~/.bashrc"`

### `npm/scripts/preuninstall.sh`
1. Detect shell same way
2. Remove lines between `# >>> Git-guard by Sulaiman Misri >>>` and `# <<< Git-guard <<<` from rc file
3. Print: `"git-guard removed. Reload with: exec zsh"` or `"source ~/.bashrc"`

### `npm/package.json`
```json
{
  "name": "git-guard",
  "version": "1.0.0",
  "description": "Lightweight Git safety guard — blocks unsafe git pull commands",
  "bin": {
    "git-guard": "./cli.js"
  },
  "scripts": {
    "postinstall": "bash scripts/postinstall.sh",
    "preuninstall": "bash scripts/preuninstall.sh"
  },
  "files": ["cli.js", "scripts/", "wrappers/"],
  "license": "MIT",
  "engines": { "node": ">=18" }
}
```

### `manual/` — Existing Files, Restructured
- `manual/macos/zshrc.env` — current `zshrc.env` content
- `manual/macos/git-pull-guard.mjs` — current `git-pull-guard.mjs` content (unchanged)
- `manual/ubuntu/bashrc.env` — current `bashrc.env` content
- `manual/ubuntu/git-pull-guard.mjs` — current `git-pull-guard.mjs` content (unchanged)

### Root Files
- `.gitignore` — add `node_modules/`, `npm/package-lock.json`
- `readme.md` — update navigation, add npm install instructions above manual instructions
- `image.png` and `image-1.png` stay at root (both readme sections use them)

## Upgrade Guide

Upgrades are automatic. When a user runs `npm update -g git-guard` (or `npm install -g git-guard@latest`), the `postinstall` script fires again and handles the transition:

```
npm update -g git-guard
      │
      ▼
postinstall.sh runs
      │
      ├── 1. Detects shell (zsh / bash)
      ├── 2. Finds the rc file (~/.zshrc or ~/.bashrc)
      ├── 3. Searches for sentinel: # >>> Git-guard by Sulaiman Misri >>>
      │      │
      │      ├── Found? → Delete old block (sentinel to sentinel)
      │      └── Not found? → Fresh install, nothing to remove
      ├── 4. Preserves GIT_GUARD_ALLOWED_BRANCH if user customized it
      ├── 5. Appends the latest wrapper template
      └── 6. Prints reload instruction
      │
      ▼
User runs: exec zsh   (or source ~/.bashrc)
      │
      ▼
Updated git-guard is active
```

### What the user does
```
npm update -g git-guard          # pulls latest version
exec zsh                          # reloads shell (or: source ~/.bashrc)
```

### What the user never needs to do
- No manual rc file editing on upgrade
- No reconfiguration — their `GIT_GUARD_ALLOWED_BRANCH` survives upgrades
- No uninstall-before-install — old wrapper is cleaned automatically

### How `GIT_GUARD_ALLOWED_BRANCH` survives upgrades
If the user set a custom value *inside* the sentinel block (by editing their rc file), that would normally get wiped on upgrade. To prevent this, the wrapper template documents that users should export the variable *outside* the block:

```sh
# Users should set their allowed branch here, OUTSIDE the block:
export GIT_GUARD_ALLOWED_BRANCH=production

# >>> Git-guard by Sulaiman Misri >>>   ← block starts
# (wrapper code — no export line needed if user set it above)
git() { ... }
# <<< Git-guard <<<                      ← block ends
```

The `postinstall.sh` script detects this external export and omits the default `export` line from the injected template, so the user's custom value is never overwritten.

### Manual folder users
Users who chose the copy-paste approach are unaffected by npm upgrades. They upgrade by pulling the latest `manual/` files and re-pasting the wrapper into their rc file.

## Verification
- `npm pack` in `npm/` produces a tarball with correct files
- `npm install -g ./git-guard-1.0.0.tgz` injects wrapper into rc file
- `git pull origin wrong-branch` gets blocked
- `npm uninstall -g git-guard` removes wrapper cleanly
- `npm update -g git-guard` → old block deleted, new block appended, `GIT_GUARD_ALLOWED_BRANCH` preserved
- Manual folder still works for copy-paste flow
