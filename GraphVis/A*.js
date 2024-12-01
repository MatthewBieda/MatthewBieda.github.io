// Define grid properties
const gridSize = 25;
const cellSize = 20;
const start = { row: 5, col: 5 };
const goal = { row: 20, col: 20 };

// Create the grid as an SVG grid of rectangles
const grid = [];
const svg = document.getElementById("grid");

for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
        grid[row][col] = {
            row,
            col,
            passable: true,
            g: Infinity,
            h: Infinity,
            f: Infinity,
            previous: null
        };

        const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        cell.setAttribute("x", col * cellSize);
        cell.setAttribute("y", row * cellSize);
        cell.setAttribute("width", cellSize);
        cell.setAttribute("height", cellSize);
        cell.setAttribute("class", "cell");
        cell.setAttribute("id", `cell-${row}-${col}`);
        svg.appendChild(cell);
    }
}

// Mark the start and goal cells
document.getElementById(`cell-${start.row}-${start.col}`).setAttribute("class", "start");
document.getElementById(`cell-${goal.row}-${goal.col}`).setAttribute("class", "goal");

// A* algorithm with visualization steps
async function aStar() {
    const openList = [];
    const closedList = [];
    let step = 0;

    // Set the start node
    const startNode = grid[start.row][start.col];
    startNode.g = 0;
    startNode.h = heuristic(startNode, grid[goal.row][goal.col]);
    startNode.f = startNode.g + startNode.h;

    openList.push(startNode);

    while (openList.length > 0) {
        // Get the node with the least f value
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        closedList.push(current);

        // Check if we've reached the goal
        if (current.row === goal.row && current.col === goal.col) {
            await reconstructPath(current);
            return;
        }

        // Get neighbors
        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedList.includes(neighbor) || !neighbor.passable) continue;

            const tentativeG = current.g + 1;
            const tentativeH = heuristic(neighbor, grid[goal.row][goal.col]);
            const tentativeF = tentativeG + tentativeH;

            if (!openList.includes(neighbor) || tentativeF < neighbor.f) {
                neighbor.g = tentativeG;
                neighbor.h = tentativeH;
                neighbor.f = tentativeF;
                neighbor.previous = current;

                if (!openList.includes(neighbor)) openList.push(neighbor);

                // Update SVG for the visited cell
                document.getElementById(`cell-${neighbor.row}-${neighbor.col}`).setAttribute("class", "visited");
            }
        }

        // Wait for a short period before proceeding to the next step
        await delay(100); // Delay in milliseconds
    }

    return null; // No path found
}

// Heuristic function (Manhattan distance)
function heuristic(node, goal) {
    return Math.abs(node.row - goal.row) + Math.abs(node.col - goal.col);
}

// Reconstruct the path
async function reconstructPath(goalNode) {
    let current = goalNode;
    const path = [];

    while (current) {
        path.unshift(current); // Add to the beginning of the array
        current = current.previous;
    }

    // Update the SVG to show the path
    for (const node of path) {
        document.getElementById(`cell-${node.row}-${node.col}`).setAttribute("class", "path");
        await delay(100); // Add delay for path visualization
    }
}

// Get neighbors of a given node (4 directions)
function getNeighbors(node) {
    const neighbors = [];

    const directions = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 },  // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }   // Right
    ];

    for (const dir of directions) {
        const newRow = node.row + dir.row;
        const newCol = node.col + dir.col;

        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            neighbors.push(grid[newRow][newCol]);
        }
    }

    return neighbors;
}

// Block some cells to create obstacles
function createObstacle(row, col) {
    const cell = grid[row][col];
    cell.passable = false;
    document.getElementById(`cell-${row}-${col}`).setAttribute("class", "obstacle");
}

// Add a delay (in milliseconds)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.onload = () => {
    function generateRandomObstacles() {
        const obstacleCount = Math.floor(gridSize * gridSize * 0.3); // 30% of the grid as obstacles
        for (let i = 0; i < obstacleCount; i++) {
            const randomRow = Math.floor(Math.random() * gridSize);
            const randomCol = Math.floor(Math.random() * gridSize);

            // Avoid placing obstacles on the start or goal positions
            if ((randomRow === start.row && randomCol === start.col) ||
                (randomRow === goal.row && randomCol === goal.col)) {
                continue;
            }

            createObstacle(randomRow, randomCol);
        }
    }

    function clearGridObstacles() {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                grid[row][col].passable = true;
                document.getElementById(`cell-${row}-${col}`).setAttribute("class", "cell");
            }
        }
        // Reapply start and goal cell classes
        document.getElementById(`cell-${start.row}-${start.col}`).setAttribute("class", "start");
        document.getElementById(`cell-${goal.row}-${goal.col}`).setAttribute("class", "goal");
    }

    function isPathAvailable() {
        const queue = [grid[start.row][start.col]];
        const visited = new Set();
        const goalId = `cell-${goal.row}-${goal.col}`;

        while (queue.length > 0) {
            const current = queue.shift();
            const currentId = `cell-${current.row}-${current.col}`;

            if (visited.has(currentId)) continue;
            visited.add(currentId);

            // Check if we've reached the goal
            if (currentId === goalId) return true;

            // Add neighbors to the queue
            const neighbors = getNeighbors(current);
            for (const neighbor of neighbors) {
                if (neighbor.passable && !visited.has(`cell-${neighbor.row}-${neighbor.col}`)) {
                    queue.push(neighbor);
                }
            }
        }

        return false; // No path found
    }

    function setupObstacles() {
        do {
            clearGridObstacles();
            generateRandomObstacles();
        } while (!isPathAvailable());
    }

    // Set up randomized obstacles ensuring a valid path
    setupObstacles();

    // Run A* after a short delay for visual effect
    setTimeout(() => {
        aStar();
    }, 500);
};
