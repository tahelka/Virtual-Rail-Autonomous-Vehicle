class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(vertex1, vertex2, direction) {
    if (!this.adjacencyList[vertex1] || !this.adjacencyList[vertex2]) {
      throw new Error("One or both vertices do not exist.");
    }

    this.adjacencyList[vertex1].push({ node: vertex2, direction: direction });
  }

  // Depth-First Search to find all paths and directions
  findAllPaths(start, target, path = [], directions = [], visited = new Set()) {
    if (start === target) {
      return [{ path, directions }];
    }

    visited.add(start);

    let allPaths = [];

    for (const neighbor of this.adjacencyList[start]) {
      if (!visited.has(neighbor.node)) {
        const newPath = [...path, neighbor.node];
        const newDirections = [...directions, neighbor.direction];
        const newVisited = new Set(visited);
        const pathsFromNeighbor = this.findAllPaths(
          neighbor.node,
          target,
          newPath,
          newDirections,
          newVisited
        );
        allPaths = allPaths.concat(pathsFromNeighbor);
      }
    }

    visited.delete(start);

    return allPaths;
  }

  // Function to find the shortest paths with least direction changes
  findShortestPaths(paths) {
    if (paths.length === 0) {
      return [];
    }

    const shortestLength = Math.min(...paths.map((path) => path.path.length));

    // Calculate the number of direction changes for each path
    const pathsWithDirectionChanges = paths.map((path) => ({
      path,
      numDirectionChanges: path.directions.filter(
        (dir, i) => i > 0 && dir !== path.directions[i - 1]
      ).length,
    }));

    // Find the minimum number of direction changes among the shortest paths
    const minDirectionChanges = Math.min(
      ...pathsWithDirectionChanges
        .filter((path) => path.path.path.length === shortestLength)
        .map((path) => path.numDirectionChanges)
    );

    // Filter paths with the shortest length and minimum direction changes
    return pathsWithDirectionChanges.filter(
      (path) =>
        path.path.path.length === shortestLength &&
        path.numDirectionChanges === minDirectionChanges
    );
  }
}

const graph = new Graph();

graph.addVertex("A");
graph.addVertex("B");
graph.addVertex("C");
graph.addVertex("D");
graph.addVertex("E");
graph.addVertex("F");
graph.addVertex("G");
graph.addVertex("H");
graph.addVertex("I");

graph.addEdge("A", "B", "north");
graph.addEdge("A", "F", "east");
graph.addEdge("B", "A", "south");
graph.addEdge("B", "E", "east");
graph.addEdge("B", "C", "north");
graph.addEdge("C", "B", "south");
graph.addEdge("C", "D", "east");
graph.addEdge("D", "C", "west");
graph.addEdge("D", "E", "south");
graph.addEdge("D", "G", "east");
graph.addEdge("E", "B", "west");
graph.addEdge("E", "D", "north");
graph.addEdge("E", "H", "east");
graph.addEdge("E", "F", "south");
graph.addEdge("F", "A", "west");
graph.addEdge("F", "E", "north");
graph.addEdge("F", "I", "east");
graph.addEdge("G", "D", "west");
graph.addEdge("G", "H", "south");
graph.addEdge("H", "E", "west");
graph.addEdge("H", "G", "north");
graph.addEdge("H", "I", "south");
graph.addEdge("I", "F", "west");
graph.addEdge("I", "H", "north");

const startPoint = "A";
const endPoint = "G";

const allPaths = graph.findAllPaths(startPoint, endPoint);
const shortestPaths = graph.findShortestPaths(allPaths);

if (shortestPaths.length > 0) {
  console.log(
    `Shortest paths with least direction changes from ${startPoint} to ${endPoint}:`
  );

  shortestPaths.forEach((pathObj, index) => {
    console.log(
      `Path ${index + 1}: ${[startPoint, ...pathObj.path.path].join(" -> ")}`
    );
    console.log(`Directions: ${pathObj.path.directions.join(", ")}`);
  });
} else {
  console.log("No paths found from A to G.");
}
