import {promises as fs} from 'fs'
import {glob} from 'glob'
import {parse} from 'path'
import svgStore from 'svgstore'

class SvgSprite {
    constructor({source, target, rename}){
        this.source = this.#toArray(source)
        this.target = this.#toArray(target)
        this.rename = rename ?? false;
        this.store = svgStore({
            svgAttrs: {style: 'display: none;', 'aria-hidden': 'true'},
            copyAttrs: ['width', 'height'],
        });
    }
    #removeComments(){
        this.store.element('*').contents()
            .filter((i, el) => el.type === 'comment').remove()
    }
    #toArray(value){
        return value ? Array.isArray(value) ? value : [value] : []
    }
    async bundle(){
        const list = await glob(this.source, {})
        for (let item of list) {
            const content = await fs.readFile(item)
            const info = parse(item)
            const name = this.rename ? this.rename(info) : info.name
            this.store.add(name, content, {
                symbolAttrs: {
                    'aria-labelledby': `${name}-icon`,
                    role: 'img',
                },
            })
        }
    }
    async output(){
        this.#removeComments()
        const output = this.store.toString({inline: true})
        for (let path of this.target) {
            await fs.writeFile(path, output)
        }
    }
}

const svgSprite = async (config) =>{
    const sprite = new SvgSprite(config)
    await sprite.bundle()
    await sprite.output()
}

const svgRollupSprite = (config) => {
    const sprite = new SvgSprite(config)
    return {
        name: 'svg-sprite',
        async buildStart() {
            await sprite.bundle()
        },
        async buildEnd() {
            await sprite.output()
        },
    }
}

export {svgSprite,svgRollupSprite}
