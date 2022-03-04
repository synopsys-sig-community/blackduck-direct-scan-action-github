import { find, downloadTool, cacheFile } from "@actions/tool-cache";
import { exec } from "@actions/exec";
import path from "path";
import { TOOL_VERSION } from "./inputs";
import { error, info } from "@actions/core";
import * as fs from "fs";

const IS_WINDOWS = process.platform === "win32";
const IS_LINUX = process.platform === "linux";
const IS_MACOS = process.platform === "darwin";

const TOOL_BINARY_REPO_URL = `https://github.com/synopsys-sig-community/blackduck-direct-scan-action/releases/download`;

export const TOOL_NAME = "bd_direct_scan";

export async function findOrDownloadTool(): Promise<string> {
  let bin_name = get_tool_binary_name();

  info(`bin_name = ${bin_name}`);

  const cached_tool = find(bin_name, TOOL_VERSION);
  if (cached_tool) {
    return path.resolve(cached_tool, bin_name);
  }

  info(`cached_tool = ${cached_tool}`);

  const download_url = createDetectDownloadUrl();

  info(`download_url = ${download_url}`);

  const tool_download_path = await downloadTool(download_url);
  const cacheFolder = await cacheFile(
    tool_download_path,
    bin_name,
    TOOL_NAME,
    TOOL_VERSION
  );

  info(
    `Downloaded: ` +
      download_url +
      ` to ` +
      tool_download_path +
      ` in: ` +
      cacheFolder
  );
  info(`cacheFolder=` + cacheFolder + ` binaryName=` + bin_name);

  await fs.chmod(cacheFolder + "/" + bin_name, 0o555, function () {});

  return path.resolve(cacheFolder, bin_name);
}

export async function run_tool(
  tool_path: string,
  args: string[]
): Promise<number> {
  info(`run_tool tool_path = ${tool_path} args = ${args}`);
  return exec(tool_path, args, { ignoreReturnCode: true });
}

function get_tool_binary_name(): string {
  if (IS_WINDOWS) {
    return `${TOOL_NAME}-win32.exe`;
  } else if (IS_LINUX) {
    return `${TOOL_NAME}-linux`; // TODO Replace _ with -
  } else if (IS_MACOS) {
    return `${TOOL_NAME}-darwin`;
  } else {
    error(`Platform ${process.platform} not supported by this GitHub Action`);
    return ``;
  }
}

function createDetectDownloadUrl(repoUrl = TOOL_BINARY_REPO_URL): string {
  let bin_name = get_tool_binary_name();
  if (IS_WINDOWS) {
    return `${repoUrl}/${TOOL_VERSION}/${bin_name}`;
  } else if (IS_LINUX) {
    return `${repoUrl}/${TOOL_VERSION}/${bin_name}`;
  } else if (IS_MACOS) {
    return `${repoUrl}/${TOOL_VERSION}/${bin_name}`;
  } else {
    error(`Platform ${process.platform} not supported by this GitHub Action`);
    return ``;
  }
}
