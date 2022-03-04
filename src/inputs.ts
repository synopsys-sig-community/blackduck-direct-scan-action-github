import { getBooleanInput, getInput } from '@actions/core'

export const GITHUB_TOKEN = getInput('github-token')
export const BLACKDUCK_URL = getInput('blackduck-url')
export const BLACKDUCK_API_TOKEN = getInput('blackduck-api-token')
export const TOOL_VERSION = getInput('tool-version')
export const SCAN_MODE = getInput('scan-mode').toUpperCase()
