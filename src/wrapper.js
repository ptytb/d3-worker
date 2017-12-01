import { toDOM } from './dom.js';
import * as d3 from 'd3';
import { Spinner } from 'spin.js';

let maxWorkers = 1;
let taskQueue = [];

let semaphore = (() => {
    let value = maxWorkers;

    return {
        lock: function () {
            if (value === 0) {
                return false;
            }
            else {
                value -= 1;
                return true;
            }
        },
        free: function () {
            value += 1;

            if (taskQueue.length > 0) {
                taskQueue.shift()();
            }
        },
        canLock: function () {
            return value > 0;
        }
    };
})();

let spinOpts = {
  lines: 13, // The number of lines to draw
  length: 38, // The length of each line
  width: 17, // The line thickness
  radius: 45, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#000000', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  opacity: 0.25, // Opacity of the lines
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  position: 'absolute' // Element positioning
};

if (!window.Worker) {
    console.error('No worker support!');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {

        let template = document.createElement('template');
        template.id = 'd3-worker-template';
        let rootDiv = document.createElement('div');
        template.content.appendChild(rootDiv);
        document.body.appendChild(template);

        customElements.define('d3-worker',
            class extends HTMLElement {

                connectedCallback() {
                    let tmpl = template.content;
                    let rootDiv = tmpl.cloneNode(true);
                    this.shadowContainer.appendChild(rootDiv);

                    let config = {
                        source: this.getAttribute('source'),
                        type: this.getAttribute('type'),
                        renderer: this.getAttribute('renderer'),
                        settings: {}
                    };
                    let sets = this.querySelectorAll('set');
                    for (let i = 0; i < sets.length; i++) {
                        let name = sets[i].getAttribute('name');
                        let value = sets[i].getAttribute('value');
                        config.settings[name] = value;
                    }

                    let div = this.shadowContainer.querySelector('div');

                    let myself = this;

                    this.update = (function (el, update) {
                        el.spinner = ((new Spinner(spinOpts)).spin(el));
                        update();
                    }.bind(null, myself, wrap(div, config, this)));

                    setTimeout(this.update, 0);
                }

                constructor() {
                    super();

                    this.style.position = 'relative';
                    this.style.contain = 'strict';
                    this.style.display = 'inline-block';

                    this.style.minWidth = '822px';
                    this.style.minHeight = '822px';
                    this.style.maxWidth = '822px';
                    this.style.maxHeight = '822px';

                    // this.style.minWidth = '3224px';
                    // this.style.minHeight = '3244px';

                    const shadowContainer = document.createElement('div');
                    this.appendChild(shadowContainer);
                    const shadowRoot = shadowContainer.attachShadow({ mode: 'closed' });
                    this.shadowContainer =  shadowRoot; //shadowContainer.attachShadow({ mode: 'open' });
                }
            });

    });
}

export function wrap(container, config, component) {
    return ((container, config, component) => {

        let renderer = new Worker('/dist/d3-worker.js');

        let context = undefined;
        let renderBy = 'worker';
        if (typeof config.settings.exchangeFormat === 'undefined') {
            config.settings.exchangeFormat = 'html';
        }

        renderer.onmessage = function (e) {
            if (e.data.type === 'sizeHint') {
                let size = e.data.size;
                console.log('Got size hint ', size.width, size.height);
                component.style.minWidth = size.width + 'px';
                component.style.maxWidth = size.width + 'px';
                component.style.minHeight = size.height + 'px';
                component.style.maxHeight = size.height + 'px';
                return;
            }

            console.log('Worker returned');
            let svg = e.data;

            let el = container.getElementsByTagName('svg')[0];
            if (el) {
                el.remove();
            }

            switch (config.settings.exchangeFormat) {
                case 'dom':
                    toDOM(svg, container, document);
                    break;

                case 'html':
                    container.innerHTML = svg;
                    break;
            }

            component.spinner.stop();
            semaphore.free();
        };

        function update() {
            let el = container.getElementsByTagName('svg')[0];
            if (el) {
                renderBy = 'nofrag';
            }

            switch (renderBy) {
                case 'window':
                case 'nofrag': {

                    let doc;
                    if (renderBy == 'nofrag') {
                        doc = container;
                    } else {
                        doc = document.createDocumentFragment();
                    }

                    if (renderBy != 'nofrag') {
                        let svg_chart = d3.select(container).select('svg');
                        if (!svg_chart.empty()) {
                            doc.appendChild(container.getElementsByTagName('svg')[0]);
                        }
                    }
                    let svg = d3.select(doc).select('svg');
                    if (svg.empty()) {
                        svg = d3.select(doc).append('svg');
                        svg.append('g');
                    }

                    let render = function () {
                        d3[config.type](config.source, function (error, data) {
                            if (error) {
                                console.error(error);
                            }
                            let model = context.load(data);
                            let settings = Object.assign(config.settings, { model: model, svg: svg });
                            context.render.call(null, settings);
                        });

                        if (renderBy != 'nofrag') {
                            container.appendChild(doc);
                        }
                    };

                    if (typeof context === 'undefined') {
                        let xhr = new XMLHttpRequest();
                        xhr.addEventListener('load', function () {
                            let evalInContext = function(js, context) {
                                return function() { return eval(js); }.call(context, js);
                            };

                            context = { render: undefined, load: undefined };
                            evalInContext(xhr.responseText, context);
                            render();
                        });
                        xhr.open('GET', config.renderer, true);
                        xhr.send();
                    }
                    else {
                        render();
                    }
                    component.spinner.stop();
                    break;
                }

                case 'worker': {
                    if (config.settings.exchangeFormat !== 'raster') {

                        let task = (function () {
                            return function () {
                                semaphore.lock();
                                renderer.postMessage(config);
                            };
                        })();

                        if (semaphore.canLock()) {
                            task();
                        }
                        else {
                            taskQueue.push(task);
                        }

                    }
                    break;
                }
            }
        }

        return update;

    })(container, config, component);
}
