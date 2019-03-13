const TaskGraph = require('../src/TaskGraph').TaskGraph;
const {Vertex, Edge} = require("graphlabs.core.graphs");

describe('task graph: get neighbours', () => {

    test('single neighbour', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(new Edge(v1, v2));
        let result = TaskGraph.getNeighbours(v1, graph);
        expect(result.length).toBe(1);
    })

    test('no neighbours', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        graph.addVertex(v1);
        let result = TaskGraph.getNeighbours(v1, graph);
        expect(result.length).toBe(0);
    })
});

describe('task graph: get non neighbours', () => {

    test('single non neighbour', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        let v3 = new Vertex('3');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge(new Edge(v1, v2));
        graph.addEdge(new Edge(v2, v3));
        let result = TaskGraph.getNonNeighbours(v1, graph);
        expect(result.length).toBe(1);
    })

    test('no nonneighbour', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(new Edge(v1, v2));
        let result = TaskGraph.getNonNeighbours(v1, graph);
        expect(result.length).toBe(0);
    })
})

describe('task graph: get subgraph', () => {

    test('not empty set', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        let v3 = new Vertex('3');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge(new Edge(v1, v2));
        graph.addEdge(new Edge(v2, v3));
        let result = TaskGraph.getSubgraph(['1', '2'], graph);
        expect(result.vertices.length).toBe(2);
        expect(result.edges.length).toBe(1);
    })

    test('empty set', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        let v3 = new Vertex('3');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge(new Edge(v1, v2));
        graph.addEdge(new Edge(v2, v3));
        let result = TaskGraph.getSubgraph([], graph);
        expect(result.vertices.length).toBe(0);
        expect(result.edges.length).toBe(0);
    })

    test('full set', () => {
        let graph = TaskGraph.createEmpty(0);
        let v1 = new Vertex('1');
        let v2 = new Vertex('2');
        let v3 = new Vertex('3');
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge(new Edge(v1, v2));
        graph.addEdge(new Edge(v2, v3));
        let result = TaskGraph.getSubgraph(['1', '2', '3'], graph);
        expect(result.vertices.length).toBe(3);
        expect(result.edges.length).toBe(2);
    })
})