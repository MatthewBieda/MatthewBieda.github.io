class BFSVisualization {
    constructor() {
        this.visitedNodes = new Set();
        this.isRunning = false;
        this.speed = parseInt(document.getElementById("speed").value);
        this.graphType = document.getElementById("graph-type").value;

        // Edges defined in constructor or dynamic drawing
        this.edges = [
            { from: "node1", to: "node2" },
            { from: "node1", to: "node3" },
            { from: "node2", to: "node4" },
            { from: "node2", to: "node5" },
            { from: "node3", to: "node6" },
            { from: "node3", to: "node7" },
            { from: "node5", to: "node8" },
            { from: "node6", to: "node9" },
            { from: "node8", to: "node10" },
            { from: "node9", to: "node10" }
        ];
        this.nodeRadius = 20; // Radius of nodes
        this.drawEdges();
    }

    // Function to draw edges
    drawEdges() {
        this.clearEdges();  // Clear existing edges before redrawing

        this.edges.forEach(edge => {
            const fromNode = document.getElementById(edge.from);
            const toNode = document.getElementById(edge.to);

            const x1 = parseFloat(fromNode.getAttribute("cx"));
            const y1 = parseFloat(fromNode.getAttribute("cy"));
            const x2 = parseFloat(toNode.getAttribute("cx"));
            const y2 = parseFloat(toNode.getAttribute("cy"));

            // Calculate adjusted points for edge start and end
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const x1Adjusted = x1 + Math.cos(angle) * this.nodeRadius;
            const y1Adjusted = y1 + Math.sin(angle) * this.nodeRadius;
            const x2Adjusted = x2 - Math.cos(angle) * this.nodeRadius;
            const y2Adjusted = y2 - Math.sin(angle) * this.nodeRadius;

            // Create edge line
            const edgeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            edgeLine.setAttribute("x1", x1Adjusted);
            edgeLine.setAttribute("y1", y1Adjusted);
            edgeLine.setAttribute("x2", x2Adjusted);
            edgeLine.setAttribute("y2", y2Adjusted);
            edgeLine.setAttribute("class", "edge");
            edgeLine.setAttribute("id", `edge${edge.from.slice(4)}-${edge.to.slice(4)}`); // Edge ID based on node IDs

            // Add arrowhead to directed edges
            if (this.graphType === "directed") {
                edgeLine.setAttribute("marker-end", "url(#arrowhead)");
            } else {
                edgeLine.removeAttribute("marker-end");  // Remove arrowheads for undirected graph
            }

            document.querySelector("svg").appendChild(edgeLine);
        });
    }

    // Function to clear existing edges from the SVG
    clearEdges() {
        const existingEdges = document.querySelectorAll(".edge");
        existingEdges.forEach(edge => edge.remove());
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.visitedNodes.clear();
        this.traverseBFS("node1");
    }

    async traverseBFS(startNodeId) {
        const queue = [startNodeId]; // Initialize the queue with the start node
        this.visitedNodes.add(startNodeId);

        while (queue.length > 0 && this.isRunning) {
            const currentNodeId = queue.shift(); // Dequeue the first element

            // Step 1: Color the current node
            document.getElementById(currentNodeId).classList.add("visited");
            await this.delay(this.speed);

            // Step 2: Get all connected edges and traverse to neighbors
            const neighbors = this.getNeighbors(currentNodeId);

            for (let edge of neighbors) {
                const neighborId = edge.from === currentNodeId ? edge.to : edge.from;

                // Skip already visited neighbors
                if (this.visitedNodes.has(neighborId)) continue;

                // Step 3: Add the neighbor to the queue and mark as visited
                queue.push(neighborId);
                this.visitedNodes.add(neighborId);
            }
        }

        this.isRunning = false; // End the traversal when the queue is empty
    }

    // Get neighbors based on graph type
    getNeighbors(nodeId) {
        if (this.graphType === "directed") {
            return this.edges.filter(edge => edge.from === nodeId);
        } else { // undirected graph
            return this.edges.filter(edge => edge.from === nodeId || edge.to === nodeId);
        }
    }

    // Reset the graph to its initial state
    reset() {
        this.isRunning = false;
        this.visitedNodes.clear();
        document.querySelectorAll(".node").forEach(node => {
            node.classList.remove("visited");
        });
        document.querySelectorAll(".edge").forEach(edge => {
            edge.classList.remove("visited");
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize BFS visualization instance
const visualization = new BFSVisualization();

// Re-apply traversal delay when user changes speed
document.getElementById("speed").addEventListener("input", event => {
    visualization.speed = parseInt(event.target.value);
});

// Listen for changes in graph type to update edges
document.getElementById("graph-type").addEventListener("change", event => {
    visualization.graphType = event.target.value;
    visualization.drawEdges();  // Redraw the edges when the graph type changes
});

