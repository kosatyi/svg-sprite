import type { Plugin } from 'rollup'

interface fileParseInfo {
    name: string
    dir: string
}

interface renameCallback {
    (info: fileParseInfo): string
}

interface svgSpriteConfig {
    source: Array<string> | string
    target: Array<string> | string
    rename?: renameCallback
}


export function svgSprite(config: svgSpriteConfig): Promise<any>
export function svgRollupSprite(config: svgSpriteConfig): Plugin