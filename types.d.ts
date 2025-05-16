import type {Plugin} from 'rollup'

export interface FileParseInfo {
    name: string
    dir: string
}

export interface RenameCallback {
    (info: FileParseInfo): string
}

export interface SvgSpriteConfig {
    source: string[] | string
    target: string[] | string
    json?: string[] | string | false
    rename?: RenameCallback
}

export function svgSprite(config: SvgSpriteConfig): Promise<any>
export function svgRollupSprite(config: SvgSpriteConfig): Plugin & {
    buildStart: () => Promise<void>
    buildEnd: () => Promise<void>
}

export interface CheckoutConfig {
    options?: Record<string, any>
    params?: Record<string, any>
    css_variable?: Record<string, any>
}

export interface CheckoutInstance {

}

export function checkout(selector: HTMLElement | string, config: CheckoutConfig ):  CheckoutInstance