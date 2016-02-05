var startD3Scope = function(d3ContainerId) {

    Array.prototype.contains = function(v) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = function() {
        var arr = [];
        for(var i = 0; i < this.length; i++) {
            if(!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    }

    //converts graph obj descripition from key = packagist_name, value = contributors
    //to D3 usable obj
    var convertFromResponseToD3NodeList = function(taskNodes) {
        // make list of all the nodes (github users and packagist packages)
        var nodes = [];
        for (var key in taskNodes) {
            var value = taskNodes[key];

            nodes.push(key);
            nodes = nodes.concat(value.contributors);
        }

        //remove duplicates
        var uniqueNodes = nodes.unique();

        //make list of links/paths
        var links = [];
        for (var key in taskNodes) {
            var sourceIdx = uniqueNodes.indexOf(key);
            if(sourceIdx == -1)
                continue;

            var contributors = taskNodes[key].contributors;
            for (var name in contributors) {
                var targetIdx = uniqueNodes.indexOf(contributors[name]);
                if(targetIdx != -1)
                    links.push({
                        source:sourceIdx,
                        target:targetIdx,
                        distance:1
                    });
            }
        }

        // create a "safe" name
        var result = [];
        for(var i = 0; i < uniqueNodes.length; ++i) {
            var safeName = uniqueNodes[i].replace('\/','_');
            var nodeType = uniqueNodes[i].indexOf('\/') == -1 ? 'github' : 'packagist';
            result.push({
                'name':safeName,
                //set type of node
                'type':nodeType
            });
        }

        return {
            nodes: result,
            links: links
        };
    }

    var createGraph = function(taskNodes) {
        var domElemForGraph = d3ContainerId;
        //var nodeNameA = 'vsychov';/*'tedivm'*/
        //var nodeNameB = 'icio';

        var nodes = taskNodes.nodes;
        var links = taskNodes.links;

        var sp = new ShortestPathCalculator(nodes,links);
        return sp;
    };

    return {
        createGraph:createGraph,
        convertFromResponseToD3NodeList:convertFromResponseToD3NodeList
    };
};

var d3Obj = startD3Scope('#graph');
