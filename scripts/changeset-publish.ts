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

run("node", ["--run", "build:lib"]);

if (branchName === prereleaseBranch) {
  if (!(await fileExists(preStatePath))) {
    throw new Error(
      `Missing .changeset/pre.json on ${prereleaseBranch}. Enter prerelease mode before publishing from this branch.`,
    );
  }

  const preState = await readPreState();
  if (preState.mode !== "pre" || preState.tag !== prereleaseTag) {
    throw new Error(
      `Expected prerelease state ${prereleaseTag} on ${prereleaseBranch}, but found mode=${preState.mode} tag=${preState.tag}.`,
    );
  }

  run("pnpm", ["exec", "changeset", "publish", "--tag", prereleaseTag]);
} else {
  if (await fileExists(preStatePath)) {
    throw new Error(
      `Found .changeset/pre.json while publishing from ${branchName}. Prerelease state must stay on ${prereleaseBranch} only.`,
    );
  }

  run("pnpm", ["exec", "changeset", "publish"]);
}
