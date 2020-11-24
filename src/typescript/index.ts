import Application from './application.js'

declare global {
    interface Window { application: any; }
}

window.application = new Application({
    $canvas: document.querySelector('.js-canvas'),
    useComposer: true
})