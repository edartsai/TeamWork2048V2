
// ************** Generate the tree diagram	 *****************
function initTree(data, pxwidth, pxheight, elementName) {
    var margin = { top: 20, right: 120, bottom: 20, left: 150 },
        width = pxwidth - margin.right - margin.left,
        height = pxheight - margin.top - margin.bottom;

    var tree = d3.layout.tree().size([height, width]);

    var diagonal = d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; });

    var svg = d3.select(elementName).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var root = data[0];
    root.x0 = height / 2;
    root.y0 = 0;

    //initial時，將 children 與 _children 交換，達到一開始進頁面所有 nodes => collapse
    var nodes = flatten(root);
    nodes.forEach(function (d) {
        d._children = d.children;
        d.children = null;
    });

    updateTree(tree, diagonal, svg, root, root);

    d3.select(self.frameElement).style("height", "" + pxheight + "px");
}

function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

function updateTree(tree, diagonal, svg, root, source) {
    var duration = 750;
    var i = 0;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", function(d) { click(d, tree, diagonal, svg, root); } );

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

	nodeEnter.append("text")
		.attr("x", function(d) { return d.children || d._children ? -13 : 13; })
		.attr("dy", ".35em")
		.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
		.text(function(d) { return d.name; })
		.style("fill-opacity", 1e-6)
		.style("font-size", "1.5em");
        //.style("font-family", "Noto Sans TC");

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(source, tree, diagonal, svg, root) {
    if (source.children) { // collapse
        source._children = source.children;
        source.children = null;
    } else {  // Extend or Leaf click
        source.children = source._children;
        source._children = null;

        if (source.leafid !== undefined && source.leafid !== null) {
            var id = source.leafid;

            if (id === 11) {
                window.open('/images/flowchart.png');
            }
        }
    }
    updateTree(tree, diagonal, svg, root, source);
}