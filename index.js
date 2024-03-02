import {promises as fs} from 'fs'
import {glob} from 'glob'
import {parse} from 'path'
import {load} from 'cheerio'

const template = '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'

const loadXML = (text) => {
    const cheerio = load(text, {
        xmlMode: true,
    });
    cheerio('*').contents()
        .filter((i, el) =>
            el.type === 'comment' || el.type === 'text'
        )
        .remove()
    return cheerio
}

const toArray = (value) => {
    return value ? Array.isArray(value) ? value : [value] : []
}

class SvgSprite {

    constructor({source, target, rename}) {
        this.source = toArray(source)
        this.target = toArray(target)
        this.rename = rename ?? false
    }

    add(name, content) {
        const item = loadXML(content)
        const svg = item('svg:eq(0)')
        svg.attr('id',name).removeAttr('width').removeAttr('height')
        this.root.append(svg.get(0))
    }
    xml() {
        return this.element.xml()
    }

    start() {
        const element = loadXML(template)
        const root = element('svg:eq(0)')
        root.attr('xmlns', 'http://www.w3.org/2000/svg')
        root.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        root.append('<style>:root>svg{display:none}:root>svg:target{display:block}</style>')
        this.root = root;
        this.element = element;
        return this;
    }

    async bundle() {
        const list = await glob(this.source, {})
        for (let item of list) {
            const content = await fs.readFile(item)
            const info = parse(item)
            const name = this.rename ? this.rename(info) : info.name
            this.add(name, content)
        }
    }

    async output() {
        const output = this.xml()
        for (let path of this.target) {
            await fs.writeFile(path, output)
        }
    }

}

const svgSprite = async (config) => {
    const sprite = new SvgSprite(config)
    await sprite.start().bundle()
    await sprite.output()
}

const svgRollupSprite = (config) => {
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

export {svgSprite, svgRollupSprite}
