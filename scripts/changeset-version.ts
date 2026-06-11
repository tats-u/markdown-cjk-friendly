import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const preStatePath = path.join(repoRoot, ".changeset", "pre.json");
const prereleaseTag = "next";
const prereleaseBranch = "next";

function run(command: string, args: readonly string[]) {
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

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPreState() {
  return JSON.parse(await readFile(preStatePath, "utf8"));
}

const branchName = currentBranchName();

if (branchName === prereleaseBranch) {
  if (!(await fileExists(preStatePath))) {
    run("pnpm", ["exec", "changeset", "pre", "enter", prereleaseTag]);
  } else {
    const preState = await readPreState();
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
} else if (await fileExists(preStatePath)) {
  throw new Error(
    `Found .changeset/pre.json while running on ${branchName}. Prerelease state must stay on ${prereleaseBranch} only.`,
  );
}

run("pnpm", ["exec", "changeset", "version"]);
