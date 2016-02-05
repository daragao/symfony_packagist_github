/*
 *
 * Dijkstra Short Path Calculator and Graph Plotter
 * Uses D3 JS (V3)
 *
 */

var ShortestPathCalculator = function(nodes, paths) {

	this.nodes = nodes; // nodes => [ { index: 0, name: 'a', r: 20 }, ... ]
	this.paths = paths; // paths => [ { source: 0, target: 1, distance: 150 }, ... ]
	this.distances = []; // [ [ x, 100, 150 ], [ 100, x, 10] ]
	this.graph = {};

	var maxNodes = 2000;
	var minNodes = 3;

	if(!d3) throw new ShortestPathCalculator.SpcError(10, 'D3 library not found');

	if(!nodes.length || nodes.length > maxNodes || nodes.length < minNodes)
		throw new ShortestPathCalculator.
        SpcError(11,'Not enough packages with one of the names found => ' +
                 JSON.stringify(nodes) );

}

ShortestPathCalculator.isInteger = function(i) {
	return /^\d+$/.test(i);
}

ShortestPathCalculator.SpcError = function(code, message) {
	console.log(message);
	//alert(message);
	return { code: code, message: message };
}

ShortestPathCalculator.prototype.findRoute = function(source, target) {

	if(!ShortestPathCalculator.isInteger(source) || !ShortestPathCalculator.isInteger(target))
		throw new ShortestPathCalculator.SpcError(20, "Source and target must be ints");

	if(source > this.nodes.length - 1|| target > this.nodes.length - 1)
		throw new ShortestPathCalculator.SpcError(21, "Source or target put of range");

	this.makeDistanceArrayFromNodes();

	this.populateDistances();

	this.result = this.dijkstra(source, target);

	return this.result;

}

ShortestPathCalculator.prototype.findRouteByName = function(sourceName, targetName) {

    var nodes = this.nodes;
    var findNodeIndexByName = function(name) {
        var nodeIdx = nodes.findIndex(function(node) {
            return node.name == name;
        });
        return nodeIdx;
    };

    var userAIdx = findNodeIndexByName(sourceName);
    var userBIdx = findNodeIndexByName(targetName);

    if(!ShortestPathCalculator.isInteger(userAIdx) || !ShortestPathCalculator.isInteger(userBIdx))
        throw new ShortestPathCalculator.SpcError(20, "Source and target name not found");


    var route = this.findRoute(userAIdx,userBIdx)
    return route;

}

ShortestPathCalculator.prototype.makeDistanceArrayFromNodes = function() {

	this.distances = [];

	for(var i=0; i<this.nodes.length; i++) {

		this.distances[i] = [];

		for(var j=0; j<this.nodes.length; j++){
			this.distances[i][j] = 'x';
		}
	}

}

ShortestPathCalculator.prototype.populateDistances = function() {

	for(var i=0; i<this.paths.length; i++) {

        var s,t,d;
        //D3 changes the path elements
        if(typeof(this.paths[i].source) == 'number') {
            s = parseInt(this.paths[i].source);
            t = parseInt(this.paths[i].target);
            d = parseInt(this.paths[i].distance);
        } else {
            s = parseInt(this.paths[i].source.index);
            t = parseInt(this.paths[i].target.index);
            d = parseInt(this.paths[i].distance);
        }

		this.distances[s][t] = d;
		this.distances[t][s] = d;
	}

}

ShortestPathCalculator.prototype.updateGraph = function() {
    //draw d3 force
    var paths = this.paths;//$.extend(true, {}, this.paths);
    var nodes = this.nodes;//$.extend(true, {}, this.nodes);

    this.force
    .nodes(nodes)
    .links(paths)
    .start();

    var link = this.svg.selectAll(".link")
    .data(paths)
    .enter().append("line")
    .attr("class", "link")
    .attr("id", function(d) {
        return d.source.name+'-'+d.target.name;
    })
    .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

    var node = this.svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("id", function(d) { return d.name })
    .call(this.force.drag);

    node.append("circle")
    .attr("r","5");

    node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name });

    this.force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
}

ShortestPathCalculator.prototype.drawGraph = function(elementId) {

    var width = 360,
    height = 500

    d3.select("svg").remove();
    var svg = d3.select(elementId).append("svg")
    .attr("width", '100%')
    .attr("height", height);

    var force = d3.layout.force()
    .gravity(0.2)
    .distance(200)
    .charge(-100)
    .size([width, height]);

    this.svg = svg;
    this.force = force;
    this.updateGraph();

}

/*
 *
 * Calculate shortest path between two nodes in a graph
 *
 * @param {Integer} start     index of node to start from
 * @param {Integer} end       index of node to end at
 *
 */

ShortestPathCalculator.prototype.dijkstra = function(start, end) {

    var nodeCount = this.distances.length,
        infinity = 99999,  // larger than largest distance in distances array
        shortestPath = new Array(nodeCount),
        nodeChecked  = new Array(nodeCount),
        pred         = new Array(nodeCount);

    // initialise data placeholders

    for(var i=0; i<nodeCount; i++) {
        shortestPath[i] = infinity;
        pred[i]=null;
        nodeChecked[i]=false;
    }

    shortestPath[start]=0;

    for(var i=0; i<nodeCount; i++) {

        var minDist = infinity;
        var closestNode = null;

        for (var j=0; j<nodeCount; j++) {

            if(!nodeChecked[j]) {
                if(shortestPath[j] <= minDist) {
                    minDist = shortestPath[j];
                    closestNode = j;
                }
            }
        }

        nodeChecked[closestNode] = true;

        for(var k=0; k<nodeCount; k++) {
            if(!nodeChecked[k]){
                var nextDistance = distanceBetween(closestNode, k, this.distances);

                if ((parseInt(shortestPath[closestNode]) + parseInt(nextDistance)) < parseInt(shortestPath[k])){
                    soFar = parseInt(shortestPath[closestNode]);
                    extra = parseInt(nextDistance);

                    shortestPath[k] = soFar + extra;

                    pred[k] = closestNode;
                }
            }
        }

    }

    if(shortestPath[end] < infinity) {

        var newPath = [];
        var step    = { target: parseInt(end) };

        var v = parseInt(end);

        //console.log('v');
        //console.log(v);

        while (v>=0) {

            v = pred[v];

            //console.log('v');
            //console.log(v);

            if (v!==null && v>=0) {
                step.source = v;
                newPath.unshift(step);
                step = {target: v};
            }

        }

        totalDistance = shortestPath[end];

        return {
            mesg:'OK',
            path: newPath,
            source: start,
            target: end,
            distance:totalDistance
        };
    }
    else {
        return {
            mesg:'No path found',
            path: null,
            source: start,
            target: end,
            distance: 0
        };
    }

    function distanceBetween(fromNode, toNode, distances) {

        dist = distances[fromNode][toNode];

        if(dist==='x') dist = infinity;

        return dist;
    }

}

ShortestPathCalculator.prototype.colorRoute = function() {
    var route = this.result;
    var nodes = this.nodes;

    if(!route) return;

    $('.node').css('opacity','0.1');
    $('.link').css('opacity','0.1');

    for(var i = 0; i < route.path.length; i++) {
        var sourceIdx = route.path[i].source;
        var targetIdx = route.path[i].target;

        var sourceId = '#'+nodes[sourceIdx].name;
        var targetId = '#'+nodes[targetIdx].name;
        var linkId = '#'+nodes[sourceIdx].name+'-'+nodes[targetIdx].name;
        var reverseLinkId = '#'+nodes[targetIdx].name+'-'+nodes[sourceIdx].name;

        var selector = sourceId+', '+targetId+', '+linkId+', '+reverseLinkId;
        $path = $(selector);
        $path.css('opacity','1')
        $path.find('circle').css('fill','green');
        $path.filter('.link').css('stroke','green');
    }
}
