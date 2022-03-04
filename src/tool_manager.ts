import { find, downloadTool, cacheFile } from "@actions/tool-cache";
import { exec } from "@actions/exec";
import path from "path";
import { TOOL_VERSION } from "./inputs";
import { error, info } from "@actions/core";

const IS_WINDOWS = process.platform === "win32";
const IS_LINUX = process.platform === "linux";
const IS_MACOS = process.platform === "darwin";

const TOOL_BINARY_REPO_URL = `https://github.com/synopsys-sig-community/blackduck-direct-scan-action/releases/download`;

export const TOOL_NAME = "bd_direct_scan";

export async function findOrDownloadTool(): Promise<string> {
  let bin_name = TOOL_NAME;

  if (IS_WINDOWS) {
    bin_name += ".exe";
  }

  info(`bin_name = ${bin_name}`);

  const cached_tool = find(bin_name, TOOL_VERSION);
  if (cached_tool) {
    return path.resolve(cached_tool, bin_name);
  }

  info(`cached_tool = ${cached_tool}`);

  const download_url = createDetectDownloadUrl();

  info(`download_url = ${download_url}`);

  return (
    downloadTool(download_url)
      .then((detectDownloadPath) =>
        cacheFile(detectDownloadPath, bin_name, TOOL_NAME, TOOL_VERSION)
      )
      //TODO: Jarsigner?
      .then((cachedFolder) => path.resolve(cachedFolder, bin_name))
  );
}

export async function run_tool(
  tool_path: string,
  args: string[]
): Promise<number> {
  info(`run_tool tool_path = ${tool_path} args = ${args}`);
  return exec(tool_path, args, { ignoreReturnCode: true });
}

function createDetectDownloadUrl(repoUrl = TOOL_BINARY_REPO_URL): string {
  if (IS_WINDOWS) {
    return `${repoUrl}/${TOOL_VERSION}/${TOOL_NAME}-win32`;
  } else if (IS_LINUX) {
    return `${repoUrl}/${TOOL_VERSION}/${TOOL_NAME}_linux`; // TODO Replace _ with -
  } else if (IS_MACOS) {
    return `${repoUrl}/${TOOL_VERSION}/${TOOL_NAME}_darwin`;
  } else {
    error(`Platform ${process.platform} not supported by this GitHub Action`);
    return ``;
  }
}
