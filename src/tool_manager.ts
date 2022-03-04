import { find, downloadTool, cacheFile } from '@actions/tool-cache'
import { exec } from '@actions/exec'
import path from 'path'
import { DETECT_VERSION } from './inputs'

const IS_WINDOWS = process.platform === 'win32'
const IS_LINUX = process.platform === 'linux'
const IS_MACOS = process.platform === 'darwin'

const SCRIPT_LATEST_TAG = 'v0.1.0-TEST'
const SCRIPT_BINARY_REPO_URL = `https://github.com/synopsys-sig-community/blackduck-direct-scan-action/releases/tag/${SCRIPT_LATEST_TAG}#:~:text=` // bd_direct_scan%2Dmacos
const DETECT_BINARY_REPO_URL = 'https://sig-repo.synopsys.com'
export const TOOL_NAME = 'detect'

export async function findOrDownloadScript(): Promise<string> {
    const jarName = `synopsys-detect-${DETECT_VERSION}.jar`

    const cachedDetect = find(TOOL_NAME, DETECT_VERSION)
    if (cachedDetect) {
        return path.resolve(cachedDetect, jarName)
    }

    const detectDownloadUrl = createDetectDownloadUrl()

    return (
        downloadTool(detectDownloadUrl)
            .then(detectDownloadPath => cacheFile(detectDownloadPath, jarName, TOOL_NAME, DETECT_VERSION))
            //TODO: Jarsigner?
            .then(cachedFolder => path.resolve(cachedFolder, jarName))
    )
}

export async function runDetect(detectPath: string, detectArguments: string[]): Promise<number> {
    return exec(`java`, ['-jar', detectPath].concat(detectArguments), { ignoreReturnCode: true })
}

function createDetectDownloadUrl(repoUrl = DETECT_BINARY_REPO_URL): string {
    return `${repoUrl}/bds-integrations-release/com/synopsys/integration/synopsys-detect/${DETECT_VERSION}/synopsys-detect-${DETECT_VERSION}.jar`
}
