let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let nodes = [];
let edges = [];

function Node(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
}

function Edge(source, dest, distance) {
    this.source = source;
    this.dest = dest;
    this.distance = distance;
}

class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(node) {
        this.heap.push(node);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
    }

    updateKey(id, newDistance) {
        for (let i = 0; i < this.heap.length; i++) {
            if (this.heap[i].id === id) {
                this.heap[i].distance = newDistance;
                this.bubbleUp(i);
                break;
            }
        }
    }

    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            let parent = Math.floor((current - 1) / 2);
            if (this.heap[current].distance < this.heap[parent].distance) {
                [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
                current = parent;
            } else {
                break;
            }
        }
    }

    sinkDown(index) {
        let current = index;
        const length = this.heap.length;
        while (true) {
            let leftChild = 2 * current + 1;
            let rightChild = 2 * current + 2;
            let smallest = current;
            if (leftChild < length && this.heap[leftChild].distance < this.heap[smallest].distance) {
                smallest = leftChild;
            }
            if (rightChild < length && this.heap[rightChild].distance < this.heap[smallest].distance) {
                smallest = rightChild;
            }
            if (smallest !== current) {
                [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
                current = smallest;
            } else {
                break;
            }
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

function addNode(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let id = nodes.length;
    nodes.push(new Node(id, x, y));
    drawGraph();
}

function addEdge() {
    let sourceNode = parseInt(document.getElementById('sourceNode').value);
    let destNode = parseInt(document.getElementById('destNode').value);
    let distance = parseInt(document.getElementById('distance').value);
    if (sourceNode >= 0 && sourceNode < nodes.length && destNode >= 0 && destNode < nodes.length && sourceNode !== destNode && distance > 0) {
        edges.push(new Edge(sourceNode, destNode, distance));
        drawGraph();
    } else {
        alert("Invalid input!");
    }
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < edges.length; i++) {
        let source = nodes[edges[i].source];
        let dest = nodes[edges[i].dest];
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(dest.x, dest.y);
        ctx.stroke();
        ctx.fillText(edges[i].distance, (source.x + dest.x) / 2, (source.y + dest.y) / 2);
    }
    for (let i = 0; i < nodes.length; i++) {
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(i, nodes[i].x + 10, nodes[i].y - 10);
    }
}

function findShortestPath() {
    let sourceNode = parseInt(document.getElementById('sourceNode').value);
    let destNode = parseInt(document.getElementById('destNode').value);
    let resultDiv = document.getElementById('result');
    
    function findNodeIndex(nodeId) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
                return i;
            }
        }
        return -1; // Node not found
    }

    let distances = Array(nodes.length).fill(Infinity);
    distances[sourceNode] = 0;

    let previous = Array(nodes.length).fill(null);

    let pq = new MinHeap();
    nodes.forEach((node, index) => {
        pq.insert({ id: index, distance: distances[index] });
    });

    while (!pq.isEmpty()) {
        let current = pq.extractMin().id;
        if (current === destNode) {
            break; // Reached destination node
        }
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].source === current) {
                let neighbor = edges[i].dest;
                let alt = distances[current] + edges[i].distance;
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = current;
                    pq.updateKey(neighbor, alt);
                }
            }
        }
    }

    let shortestPath = [];
    let current = destNode;
    while (current !== null) {
        shortestPath.unshift(current);
        current = previous[current];
    }

    let pathOutput = "Shortest Path: " + shortestPath.join(" -> ");
    let distanceOutput = "Total Distance: " + distances[destNode];
    
    // Display the result in the resultDiv
    resultDiv.innerHTML = "<p>" + pathOutput + "</p><p>" + distanceOutput + "</p>";
}

// Additional code to initialize the canvas size
canvas.width = 600;
canvas.height = 400;
