import { EventEmitter } from './event-emitter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class Resources extends EventTarget {

    toLoad: any;
    loaded: any;
    items: any;
    trigger: any;
    loaders: any;

    /**
     * Constructor
     */
    constructor() {
        super()

        this.toLoad = 0
        this.loaded = 0
        this.items = {}

        this.setLoaders();
    }

    /**
     * Set loaders
     */
    setLoaders() {
        this.loaders = []

        // Images
        this.loaders.push({
            extensions: ['jpg', 'png'],
            action: (resource: any) => {
                const image = new Image()

                image.addEventListener('load', () => {
                    this.fileLoadEnd(resource, image)
                })

                image.addEventListener('error', () => {
                    this.fileLoadEnd(resource, image)
                })

                image.src = resource.source
            }
        })

        // Draco
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')
        dracoLoader.setDecoderConfig({ type: 'js' })

        this.loaders.push({
            extensions: ['drc'],
            action: (resource: any) => {
                dracoLoader.load(resource.source, (_data) => {
                    this.fileLoadEnd(resource, _data)

                    dracoLoader.dispose();
                })
            }
        })

        // GLTF
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)

        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (resource: any) => {
                gltfLoader.load(resource.source, (_data) => {
                    this.fileLoadEnd(resource, _data)
                })
            }
        })

        // FBX
        const fbxLoader = new FBXLoader()

        this.loaders.push({
            extensions: ['fbx'],
            action: (resource: any) => {
                fbxLoader.load(resource.source, (_data) => {
                    this.fileLoadEnd(resource, _data)
                })
            }
        })
    }

    /**
     * Load
     */
    load(resources: any = []) {
        for (const resource of resources) {
            this.toLoad++
            const extensionMatch = resource.source.match(/\.([a-z]+)$/)

            if (typeof extensionMatch[1] !== 'undefined') {
                const extension = extensionMatch[1]
                const loader = this.loaders.find((loader: any) => loader.extensions.find((ext: any) => extension === ext))

                if (loader) {
                    loader.action(resource)
                }
                else {
                    console.warn(`Cannot found loader for ${resource}`)
                }
            }
            else {
                console.warn(`Cannot found extension of ${resource}`)
            }
        }
    }

    /**
     * File load end
     */
    fileLoadEnd(resource: any, data: any) {
        this.loaded++
        this.items[resource.name] = data

        this.trigger('fileEnd', [resource, data])

        if (this.loaded === this.toLoad) {
            this.trigger('end')
        }
    }
}