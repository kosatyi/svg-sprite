import {promises as fs} from 'fs'
import {glob} from 'glob'
import {parse} from 'path'
import {Cheerio, CheerioAPI, load} from 'cheerio'
import type {Plugin} from 'rollup'
import type {AnyNode} from "domhandler";
import {RenameCallback, SvgSpriteConfig} from './types'

const template = '<?xml version="1.0" encoding="UTF-8"?><svg><defs></defs></svg>'

const loadXML = (text: string) => {
    const cheerio = load(text, {
        xml: true,
    });
    cheerio('*').contents()
        .filter((_, el) =>
            el.type === 'comment' || el.type === 'text'
        )
        .remove()
    return cheerio
}

const toArray = (value: any) => {
    return value ? Array.isArray(value) ? value : [value] : []
}

class SvgSprite {
    private readonly source: string[];
    private readonly target: string[];
    private readonly json: string[];
    private readonly rename: RenameCallback;
    private readonly element: CheerioAPI;
    private root: Cheerio<AnyNode>;
    private defs: Cheerio<AnyNode>;
    private item: Cheerio<AnyNode>;
    private readonly list: Map<string, string[]>;

    constructor({source, target, rename, json}: SvgSpriteConfig) {
        this.source = toArray(source)
        this.target = toArray(target)
        this.json = toArray(json)
        this.rename = rename
        this.element = loadXML(template)
        this.item = loadXML('<g></g>')('g:eq(0)')
        this.root = this.element('svg:eq(0)')
        this.defs = this.element('defs:eq(0)')
        this.list = new Map()
        this.root.attr('xmlns', 'http://www.w3.org/2000/svg')
        this.root.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    }

    add(name: string, content: string) {
        const svg = loadXML(content)('svg:eq(0)')
        const group = this.item.clone()
        const viewBox = svg.attr('viewBox')
        //svg.each((_, el) => { el.attribs = {viewBox} });
        this.list.set(name, [viewBox, svg.html()])
        group.attr('id', name)
        group.append(svg)
        this.defs.append(group)
    }

    xml() {
        return this.element.xml()
    }

    start() {
        this.defs.empty()
        this.list.clear()
        return this;
    }

    async bundle() {
        const list = await glob(this.source, {})
        for (let item of list) {
            const content = await fs.readFile(item)
            const info = parse(item)
            const name = this.rename ? this.rename(info) : info.name
            this.add(name, content.toString())
        }
    }
    async output() {
        const output = this.xml()
        for (let path of this.json) {
            await fs.mkdir(parse(path).dir, {recursive: true})
            await fs.writeFile(path, JSON.stringify(Object.fromEntries(this.list)))
        }
        for (let path of this.target) {
            await fs.mkdir(parse(path).dir, {recursive: true})
            await fs.writeFile(path, output)
        }
    }
}

export const svgSprite = async (config: SvgSpriteConfig) => {
    const sprite = new SvgSprite(config)
    await sprite.start().bundle()
    await sprite.output()
}

export const svgRollupSprite = (config: SvgSpriteConfig): Plugin => {
    const sprite = new SvgSprite(config)
    return {
        name: 'svg-sprite',
        async buildStart() {
            await sprite.start().bundle()
        },
        async buildEnd() {
            await sprite.output()
        },
    }
}

