import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const preStatePath = path.join(repoRoot, ".changeset", "pre.json");
const prereleaseTag = "next";
const prereleaseBranch = "next";

function run(command, args) {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

function currentBranchName() {
  return (
    process.env.GITHUB_REF_NAME ??
    process.env.CHANGESET_BRANCH ??
    execFileSync("git", ["branch", "--show-current"], {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim()
  );
}

function readPreState() {
  return JSON.parse(readFileSync(preStatePath, "utf8"));
}

const branchName = currentBranchName();

if (branchName === prereleaseBranch) {
  if (!existsSync(preStatePath)) {
    run("pnpm", ["exec", "changeset", "pre", "enter", prereleaseTag]);
  } else {
    const preState = readPreState();
    if (preState.mode !== "pre") {
      throw new Error(
        `Expected .changeset/pre.json to stay in prerelease mode on ${prereleaseBranch}, but found mode=${preState.mode}.`,
      );
    }
    if (preState.tag !== prereleaseTag) {
      throw new Error(
        `Expected prerelease tag ${prereleaseTag} on ${prereleaseBranch}, but found ${preState.tag}.`,
      );
    }
  }
} else if (existsSync(preStatePath)) {
  throw new Error(
    `Found .changeset/pre.json while running on ${branchName}. Prerelease state must stay on ${prereleaseBranch} only.`,
  );
}

run("pnpm", ["exec", "changeset", "version"]);
