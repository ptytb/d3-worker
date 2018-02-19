export class BaseRenderer {
    constructor() {
    }

    load() {
        throw 'Not implemented';
    }

    render() {
        throw 'Not implemented';
    }

    sizeHint(size) {
        if (self && typeof self.postMessage === 'function') {
            self.postMessage({ type: 'sizeHint', size: size });
        }
    }
    
    register() {
        const me = this;
        (function () {         
            const context = (typeof this !== 'undefined' ? this : self);
            context.render = me.render.bind(me);
            context.load = me.load.bind(me);
        })();
    }
}
