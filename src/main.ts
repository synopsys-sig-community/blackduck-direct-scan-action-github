import { info, warning, setFailed, debug } from "@actions/core";
import { context } from "@actions/github";
import path from "path";
import {
  BLACKDUCK_API_TOKEN,
  BLACKDUCK_URL,
  TOOL_VERSION,
  SCAN_MODE,
  OUTPUT_PATH,
  DEBUG,
  TRUST_CERT,
  FIX_PR,
  COMMENT_ON_PR,
  UPGRADE_MAJOR,
  SARIF,
  INCREMENTAL_RESULTS,
  NO_CHECK,
  DETECT_OPTS,
  PROJECT,
  VERSION,
  GITHUB_TOKEN,
} from "./inputs";
import { TOOL_NAME, findOrDownloadTool, run_tool } from "./tool_manager";

export async function run() {
  info(`tool-version: ${TOOL_VERSION}`);
  info(`scan-mode: ${SCAN_MODE}`);

  info(`sha: ${context.sha}`);
  info(`repo: ${context.repo.repo}`);
  info(`ref: ${context.ref}`);
  info(`api: ${context.apiUrl}`);

  process.env.GITHUB_API_URL = context.apiUrl;
  process.env.GITHUB_TOKEN = GITHUB_TOKEN;
  process.env.GITHUB_REPOSITORY = `${context.repo.owner}/${context.repo.repo}`;
  process.env.GITHUB_REF = context.ref;
  process.env.GITHUB_SHA = context.sha;

  const runnerTemp = process.env.RUNNER_TEMP;
  let outputPath = "";
  if (OUTPUT_PATH !== "") {
    outputPath = OUTPUT_PATH;
  } else if (runnerTemp === undefined) {
    setFailed(
      "$RUNNER_TEMP is not defined and output was not set. Cannot determine where to store output files."
    );
    return;
  } else {
    outputPath = path.resolve(runnerTemp, "blackduck");
  }

  const tool_args = [
    `--debug=${DEBUG}`,
    `--url=${BLACKDUCK_URL}`,
    `--token=${BLACKDUCK_API_TOKEN}`,
    `--trustcert=${TRUST_CERT}`,
    `--mode=${SCAN_MODE}`,
    `--output=${outputPath}`,
    `--fix_pr=${FIX_PR}`,
    `--comment_on_pr=${COMMENT_ON_PR}`,
    `--upgrade_major=${UPGRADE_MAJOR}`,
    `--sarif=${SARIF}`,
    `--incremental_results=${INCREMENTAL_RESULTS}`,
    `--nocheck=${NO_CHECK}`,
    "--scm=github",
  ];

  if (DETECT_OPTS !== "") {
    tool_args.push(`--detect_opts=${DETECT_OPTS}`);
  }

  if (PROJECT !== "") {
    tool_args.push(`--project=${PROJECT}`);
  }

  if (VERSION !== "") {
    tool_args.push(`--version=${VERSION}`);
  }

  info(`tool_args=${tool_args}`);

  const tool_path = await findOrDownloadTool().catch((reason) => {
    setFailed(`Could not download ${TOOL_NAME} ${TOOL_VERSION}: ${reason}`);
  });

  if (tool_path === undefined) {
    debug(`Could not determine ${TOOL_NAME} path.`);
    return;
  }

  const tool_exit_code = await run_tool(tool_path, tool_args).catch(
    (reason) => {
      setFailed(`Could not execute ${TOOL_NAME} ${TOOL_VERSION}: ${reason}`);
    }
  );

  if (tool_exit_code === undefined) {
    debug(`Could not determine ${TOOL_NAME} exit code. `);
    return;
  } else if (tool_exit_code > 0) {
    setFailed(
      `Detect failed with exit code: ${tool_exit_code}. Check the logs for more information.`
    );
    return;
  }

  info(`${TOOL_NAME} executed successfully.`);
}

run();
