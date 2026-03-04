import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const rootDir = join(fileURLToPath(import.meta.url), "..", "..");
const packagesDir = join(rootDir, "packages");

interface PackageInfo {
  dirName: string;
  name: string;
  version: string;
  tag: string;
}

async function getPackages(): Promise<PackageInfo[]> {
  const dirs = await readdir(packagesDir, { withFileTypes: true });
  const packages: PackageInfo[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) {
      continue;
    }
    if (dir.name === "markdown-it-cj-friendly") {
      // skip deprecated package
      continue;
    }
    const pkgJsonPath = join(packagesDir, dir.name, "package.json");
    try {
      const { name, version } = (
        await import(pathToFileURL(pkgJsonPath).href, {
          with: { type: "json" },
        })
      ).default as {
        name: string;
        version: string;
      };
      packages.push({
        dirName: dir.name,
        name,
        version,
        tag: `${dir.name}@${version}`,
      });
    } catch {
      // skip directories without a valid package.json
    }
  }

  return packages.sort((a, b) => a.dirName.localeCompare(b.dirName));
}

function getExistingTags(): Set<string> {
  const output = execFileSync("git", ["tag", "-l"], {
    encoding: "utf-8",
    cwd: rootDir,
  });
  return new Set(output.split("\n").filter(Boolean));
}

function createTag(tag: string): void {
  execFileSync("git", ["tag", tag], { cwd: rootDir, stdio: "inherit" });
}

function pushTag(tag: string): void {
  execFileSync("git", ["push", "origin", tag], {
    cwd: rootDir,
    stdio: "inherit",
  });
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
      "no-push": { type: "boolean", default: false },
    },
    strict: true,
    allowPositionals: true,
  });
  const dryRun = values["dry-run"] ?? false;
  const noPush = values["no-push"] ?? false;

  const packages = await getPackages();
  const existingTags = getExistingTags();

  const pending = packages.filter((pkg) => !existingTags.has(pkg.tag));

  if (pending.length === 0) {
    console.log("All tags are already created. Nothing to do.");
    return;
  }

  console.log("Tags to create:");
  for (const pkg of pending) {
    console.log(`  ${pkg.tag}  (${pkg.name})`);
  }
  console.log();

  if (dryRun) {
    console.log("Dry run — no tags were created.");
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Proceed? [y/N] ");
  rl.close();

  if (answer.toLowerCase() !== "y") {
    console.log("Aborted.");
    return;
  }

  for (const pkg of pending) {
    console.log(`Creating tag: ${pkg.tag}`);
    createTag(pkg.tag);
    if (!noPush) {
      console.log(`Pushing tag: ${pkg.tag}`);
      pushTag(pkg.tag);
    }
  }

  if (noPush) {
    console.log(
      "\nTags created locally. Run `git push origin --tags` to push them.",
    );
  } else {
    console.log("\nDone.");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
