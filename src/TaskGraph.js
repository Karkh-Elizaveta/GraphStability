import {Graph, Vertex, Edge} from "graphlabs.core.graphs"
import { store } from 'graphlabs.core.template';

export class TaskGraph extends Graph{

    static createGraph() {
        console.log("createGraph (TaskGraph.js): грузим граф из задания для дальнейшего использования")
        let taskGraph = Graph.createEmpty(0);
        store.getState().graph.vertices.forEach(e => taskGraph.addVertex(new Vertex(e.name)))
        store.getState().graph.edges.forEach(e => taskGraph
            .addEdge(new Edge(taskGraph.vertices.filter(v2 => v2.name == e.vertexTwo),
                taskGraph.vertices.filter(v1 => v1.name == e.vertexOne))))
        return taskGraph
    }

    static getNeighbours(vertex, graph) {
        console.log("getNeighbours (TaskGraph.js): ищем соседей вершины графа")
        let answer = graph.edges.reduce((accum, next) => (next.vertexOne == vertex) ?
            accum.concat(next.vertexTwo) : (next.vertexTwo == vertex) ?
                accum.concat(next.vertexOne) : accum, []).map(e => e.name)
        return answer
    }

    static getNonNeighbours(vertex, graph) {
        console.log("getNoNNeighbours (TaskGraph.js): ищем не-соседей вершины графа")
        let neighbours = TaskGraph.getNeighbours(vertex, graph)
        neighbours.push(vertex)
        console.log(neighbours)
        let answer = graph.vertices.reduce((accum, next) => (neighbours.includes(next.name)) ?
            accum : accum.concat(next.name), [])
        console.log('вершина ' + vertex + 'неокрестность ' + answer)
        return answer
    }

    static getSubgraph(subVertices, graph) {
        console.log("getSubgraph (TaskGraph.js): строим подграф графа")
        let subGraph = Graph.createEmpty(0)
        graph.vertices.filter(v => subVertices.includes(v.name)).forEach(v => subGraph.addVertex(v))
        graph.edges.filter(e => subVertices.includes(e.vertexOne.toString())
            && subVertices.includes(e.vertexTwo.toString()))
            .forEach(e => subGraph.addEdge(e))
        return subGraph
    }
}