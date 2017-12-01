import { Document, Node } from 'nodom';
import * as d3 from 'd3';

document = new Document();

let svg = d3.select('body').append('svg:svg');
svg.append('svg:g');


onmessage = function(e) {
    console.log('Message received by worker');

    let source, type, renderer, settings;
    ( { source, type, renderer, settings } = e.data);

    importScripts(renderer);

    d3[type](source, function (error, data) {
        if (error) {
            console.error(error);
        }
        let model = load(data);
        let config = Object.assign(settings, { model: model, svg: svg });
        render.call(null, config);
        let html;
        switch (settings.exchangeFormat) {
            case 'dom':
                html = document.body.getElementsByTagName('svg')[0];
                postMessage(html);
                break;

            case 'html':
                html = document.body.getElementsByTagName('svg')[0].outerHTML;
                postMessage(html);
                break;
        }
    });
};
