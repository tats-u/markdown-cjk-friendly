import { useQuery } from "@tanstack/solid-query";
import { gt } from "semver";
import { type Accessor, createMemo } from "solid-js";
import {
  type LoadedPlugins,
  loadPlugins,
  type MarkdownEngineFamily,
  shouldLoadVersionedPlugins,
} from "../workers/pluginLoader";

interface NPMVersionsInfo {
  tags: {
    next: string;
    latest: string;
  } & Record<string, string>;
  versions: string[];
}

function toCjkFriendlyPackageName(engine: MarkdownEngineFamily) {
  switch (engine) {
    case "markdown-it":
      return "markdown-it-cjk-friendly";
    case "micromark":
      return "micromark-extension-cjk-friendly";
  }
}

function getVersionCandidates(
  packageVersionsInfo: NPMVersionsInfo,
  bundledVersionName: string,
) {
  const latestVersion = packageVersionsInfo.tags.latest;
  let nextVersion: string | null = packageVersionsInfo.tags.next;
  const candidates = [latestVersion];
  if (gt(nextVersion, latestVersion)) {
    candidates.push(nextVersion);
  } else {
    nextVersion = null;
  }
  candidates.push(bundledVersionName);
  candidates.push(
    ...packageVersionsInfo.versions.filter(
      (version) => version !== latestVersion && version !== nextVersion,
    ),
  );
  return candidates;
}

async function fetchPackageVersions(
  engineFamily: MarkdownEngineFamily,
): Promise<NPMVersionsInfo> {
  const response = await fetch(
    `https://data.jsdelivr.com/v1/package/npm/${toCjkFriendlyPackageName(engineFamily)}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load versions (${response.status})`);
  }
  return (await response.json()) as NPMVersionsInfo;
}

export function usePlaygroundVersionList(
  engineFamily: Accessor<MarkdownEngineFamily>,
  bundledVersionName: Accessor<string>,
) {
  const query = useQuery(() => ({
    queryKey: ["playground", "versions", engineFamily()],
    queryFn: () => fetchPackageVersions(engineFamily()),
    staleTime: 1000 * 60 * 5,
    retry: false,
  }));

  const candidates = createMemo(() => {
    if (query.data) {
      return getVersionCandidates(query.data, bundledVersionName());
    }
    if (query.error) {
      return [bundledVersionName()];
    }
    return [];
  });

  const preferredVersion = createMemo(
    () => query.data?.tags.latest ?? bundledVersionName(),
  );
  const isPending = createMemo(
    () => query.isPending && !query.data && !query.error,
  );

  return {
    candidates,
    isPending,
    preferredVersion,
    query,
  };
}

export function usePlaygroundPluginQuery(
  engineFamily: Accessor<MarkdownEngineFamily>,
  version: Accessor<string>,
  bundledVersionName: Accessor<string>,
) {
  return useQuery(() => ({
    queryKey: [
      "playground",
      "plugins",
      engineFamily(),
      version(),
      bundledVersionName(),
    ],
    enabled: shouldLoadVersionedPlugins(version(), bundledVersionName()),
    queryFn: (): Promise<LoadedPlugins> =>
      loadPlugins(engineFamily(), version(), bundledVersionName()),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 1000 * 60 * 30,
    retry: false,
  }));
}
