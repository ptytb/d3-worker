import { BaseRenderer } from '../src/baseRenderer';
import 'd3';

export class Render extends BaseRenderer {
    constructor() {
        super();
        this.register();
    }

    load(data) {
        let matrix = data;
        return {
            matrix: matrix
        };
    }

    render(config) {
        let model, sortBy, svg;

        ({ svg, model, sortBy } = config);
        // let matrix = model.matrix;

        let startTime = Date.now();
        console.log('Rendering started.');

        // let columns = matrix[0];
        let columns = Array(100);
        // let data = matrix.slice(1, matrix.length);

        let gridSize = 12;
        let area = svg.select('g');

        let margin = {top: 150, right: 10, bottom: 20, left: 150};
        let screen = {
            width: gridSize * columns.length + margin.left + margin.right,
            height: gridSize * columns.length + margin.top + margin.bottom
        };

        svg
            .attr('width', screen.width + margin.left + margin.right)
            .attr('height', screen.height + margin.top + margin.bottom);

        super.sizeHint(screen);

        area
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        let nBenchmark = 50000;
        let data = [];
        for (let i=0; i < nBenchmark; i++) {
            data.push(i);
        }

        // Scale for radius
        let xr = d3.scaleLinear()
                .domain([0, nBenchmark])
                .range([0, 27]);

        // Scale for random position
        let randomPosition = function() {
            return Math.random() * 1024;
        };

        let tcColours = ['#FDBB30', '#EE3124', '#EC008C', '#F47521', '#7AC143', '#00B0DD'];
        let randomTcColour = function() {
          return Math.floor(Math.random() * tcColours.length);
        };


        let update = function() {
            let baseCircle = area.selectAll('circle');
            let baseRect = area.selectAll('rect');

            // Bind data
            baseCircle = baseCircle.data(data);
            baseRect = baseRect.data(data);

            baseRect.enter()
                    .append('rect')
                    .attr('width', xr)
                    .attr('height', xr)
                    .attr('x', randomPosition)
                    .attr('y', randomPosition)
                    .style('fill', tcColours[randomTcColour()]);

            baseCircle.enter()
                    .append('circle')
                    .attr('r', xr)
                    .attr('cx', randomPosition)
                    .attr('cy', randomPosition)
                    .attr('fill', "none")
                    .attr("stroke-width", 4)
                    .style('stroke', tcColours[randomTcColour()]);
        };

        update();

        console.log('Rendering finished in ' + (Date.now() - startTime) + ' ms.');
    }
}

new Render();
