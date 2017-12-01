# d3-worker

![preview](doc/scr.gif)

```html
        <d3-worker renderer="../test/render.js" type="json" source="../test/cor.json">
            <set name="sortBy" value="name" />
        </d3-worker> <!-- repeated 4 times -->
```

## Synopsis

This library does rendering of the d3 chart in two stages:

1. Worker stage. Renders SVG in a background process into fake-DOM.
2. Component stage. Now SVG is subdued to the real-DOM component and requires only updates, which are fast.

Both stages share the same renderer code.

The point is to allow interaction with some d3 charts while other
d3 charts are being loaded and rendered, the first time slowly.

## Install

```bash
npm install d3-worker
```

## Usage

Just use the **&lt;d3-worker&gt;** tag as above and include
*dist/d3-worker-wrapper.min.js* in your html file.

Settings can be passed to renderer script by **&lt;set&gt;** tag.

For the renderer script use the next boilerplate:

```js
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory.call(global)); // .call() needed to work in both page (local) and worker (global) contexts
}(this, (function () { 'use strict';

    function sizeHint(size) { // Tell the whole component its dimensions
        if (self && typeof self.postMessage === 'function') {
            self.postMessage({ type: 'sizeHint', size: size })
        }
    }

    function load(data) {
        let matrix = data; // got from d3.json() callback
        return {
            matrix: matrix
        };
    }

    function render(config) {
        let model, svg, myOption;
        ({ svg, model, myOption } = config);

        let screen = { width: 1000, height: 800 };
        svg
            .attr('width', screen.width)
            .attr('height', screen.height);
        sizeHint(screen);

        let area = svg.select('g');
        // resize, draw with area
    }

    let context = (typeof this !== 'undefined' ? this : self);
    context.render = render;
    context.load = load;
}
```

There's an example in */test* :

Run server from package root, go to http://localhost:8000/test

## Dependencies

- **Web Components** support in browser (turn it on in FireFox by setting *dom.webcomponents.enabled=true* and *dom.webcomponents.customelements.enabled=true*)
- **Workers** support in browser
- **nodom** library for fake-DOM (forked version for now)
- **D3** library
- **Spin.js** library for nice spinner

## Issues

There're two things can have negative affect on performance:

- serializing and de-serializing of the fake-DOM.
- layout reflow when inserting fake chunk received from worker.

The latter is resolved by means of *Shadow DOM* ability
to encapsulate its contexts [read here about CSS Containment](https://developers.google.com/web/updates/2016/06/css-containment).

The side effect is
you have to provide size hint for component manually. Otherwise, when
size is being calculated naturally, e.g. regarding with the content
have been generated by d3, the reflow time taken cancels all the positive
 effects of parallel processing.

## Todo

- [ ] component.updateFinished event
- [ ] cleanse workers
- [ ] Custom shadow DOM Styles
- [ ] Render to raster. Requires *Offscreen Canvas feature*
- [ ] Replace *eval()* with dynamic *import()*
- [ ] Zero-copy transfer from worker
- [ ] Provide *wrap()* for usage without components
- [ ] Add docs
