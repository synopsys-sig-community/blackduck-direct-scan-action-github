import { getBooleanInput, getInput } from "@actions/core";

export const GITHUB_TOKEN = getInput("github_token");
export const TOOL_VERSION = getInput("tool_version");
export const SCAN_MODE = getInput("mode").toUpperCase();
export const DEBUG = getInput("debug");
export const BLACKDUCK_URL = getInput("url");
export const BLACKDUCK_API_TOKEN = getInput("token");
export const OUTPUT_PATH = getInput("output");
export const TRUST_CERT = getInput("trustcert");
export const PROJECT = getInput("project");
export const VERSION = getInput("version");
export const FIX_PR = getInput("fix_pr");
export const COMMENT_ON_PR = getInput("comment_on_pr");
export const SARIF = getInput("sarif");
export const INCREMENTAL_RESULTS = getInput("incremental_results");
export const UPGRADE_MAJOR = getInput("upgrade_major");
export const NO_CHECK = getInput("nocheck");
export const DETECT_OPTS = getInput("detect_opts");
