import './TreeGenerate.css';
import {TaskGraph} from "./TaskGraph";
import { store } from 'graphlabs.core.template';
const d3 = require('d3');

export class Tree {
    constructor()
    {
        console.log("Tree constructor (TreeGenerate.js): инициируем дерево")
        let svgW = 100, svgH = 100, vRad = 12, xRect = 50, yRect = 16, tree = {cx: 300, cy: 30, w: 40, h: 70};
        tree.graph = TaskGraph.createGraph();
        tree.vis = {
            // идентификатор
            v: 0,
            // имя
            l: 'G',
            // граф, связанный с вершиной
            graph: tree.graph,
            // вес узла
            realWeight: tree.graph.vertices,
            // вес узла, введенный пользователем
            inputWeight: tree.graph.vertices,
            // ошибочная вершина или нет
            vertexError: false,
            // ошибочный вес или нет
            weightError: false,
            p: {x: tree.cx, y: tree.cy},
            c: []
        };
        tree.size = 1;
        tree.glabels = [];
        tree.active = undefined;

        tree.findVertice = function (id) {
            console.log("findVertice (TreeGenerate.js): ищем вершину дерева")
            function findVertice(t) {
                if (t.v === id) {
                    return t;
                }
                return t.c.find(findVertice);
            }

            return findVertice(tree.vis);
        }

        tree.findRectangle = function (id) {
            console.log("findRectangle (TreeGenerate.js): ищем вес вершины дерева")
            function findRectangle(t) {
                if (t.v === id) {
                    return t;
                }
                return t.c.find(findRectangle);
            }

            return findRectangle(tree.vis);
        }

        tree.getVertices = function () {
            console.log("getVertices (TreeGenerate.js): получаем все вершины дерева")
            let v = [];

            function getVertices(t, f) {
                v.push({v: t.v, l: t.l, p: t.p, f: f});
                t.c.forEach(function (d) {
                    return getVertices(d, {v: t.v, p: t.p});
                });
            }

            getVertices(tree.vis, {});
            return v.sort(function (a, b) {
                return a.v - b.v;
            });
        }

        tree.getEdges = function () {
            let e = [];
            console.log("getEdges (TreeGenerate.js): получаем все ребра дерева")
            function getEdges(_) {
                _.c.forEach(function (d) {
                    e.push({v1: _.v, l1: _.l, p1: _.p, v2: d.v, l2: d.l, p2: d.p});
                });
                _.c.forEach(getEdges);
            }

            getEdges(tree.vis);
            return e.sort(function (a, b) {
                return a.v2 - b.v2;
            });
        }

        tree.changeActive = function (v) {
            console.log("changeActive (TreeGenerate.js): меняем активную вершину дерева")
            tree.active = v;
            redraw(tree.size, tree.active)
        }

        tree.inputAndCheck = function () {
            console.log("inputAndCheck (TreeGenerate.js): получаем информацию о новой вершине")
            // проверка, выбрана ли вершина
            if (tree.active == undefined) {
                alert("Выберите вершину дерева, для которой надо добавить потомка")
                return
            }
            let vertexName = prompt("Введите имя вершины")
            let vertexArray = prompt("Введите множество вершин (числа через пробел")
            // проверяем введенную сроку на соответствующий формат
            if (!(/^[0-9]+(\s+[0-9]+)*$/.test(vertexArray) || /^\s*$/.test(vertexArray))) {
                alert("Пожалуйста, укажите множество вершин через пробел")
                return
            }
            tree.addLeaf(tree.active, vertexName, vertexArray.split(/\s+/))
        }

        tree.removeLeaf = function (_) {
            console.log("removeLeaf (TreeGenerate.js): удаляем вершину из дерева")
            function removeLeaf(t) {
                if (t.c.some(e => e.v === _)) {
                    t.c = t.c.filter(e => e.v !== _);
                }
                t.c.forEach(removeLeaf);
            }

            removeLeaf(tree.vis);
            reposition(tree.vis);
            tree.active = undefined;
            redraw(tree.size, tree.active);
        }

        tree.checkVertex = function (parent, vertexName) {
            console.log("checkVertex (TreeGenerate.js): проверка вершины")
            //проверка, есть ли введенная вершина в графе
            if (tree.graph.vertices.map(e => e.name).includes(vertexName)) {
                // проверка, есть ли введенная вершина в графе, соответствующем узлу-родителю
                if (parent.graph.vertices.map(e => e.name).includes(vertexName)) {
                    // проверка, есть ли у вершины родителя еще потомки
                    if (tree.findVertice(tree.active).c.length == 0) {
                        return false
                    }
                    else {
                        // проверка, дублирует ли введенная вершина одну из вершин своего уровня
                        if (!parent.c.map(e => e.l).includes(vertexName)) {
                            // проверка, входит ли добавляемая вершина в окрестность первого узла потомка
                            let firstChild = tree.findVertice(Math.min(...parent.c.map(e => e.v)))
                            if (TaskGraph.getNeighbours(firstChild.l, parent.graph).includes(vertexName)) {
                                return false
                            }
                            else {
                                store.dispatch({
                                    type: "@@notifier/add_action",
                                    payload: {
                                        fee: 5,
                                        datetime: new Date(),
                                        message: "Введенная вершина не входит в окрестность первого потомка выбранной вершины"
                                    }
                                })
                                return true;
                            }
                        }
                        else {
                            store.dispatch({
                                type: "@@notifier/add_action",
                                payload: {
                                    fee: 5,
                                    datetime: new Date(),
                                    message: "У выбранной вершины уже есть потомок с этим именем"
                                }
                            })
                            return true;
                        }
                    }
                }
                else {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 5,
                            datetime: new Date(),
                            message: "Вершины с данным именем нет в графе, соответствующем узлу-родителю"
                        }
                    })
                    return true;
                }
            }
            else {
                store.dispatch({
                    type: "@@notifier/add_action",
                    payload: {
                        fee: 5,
                        datetime: new Date(),
                        message: "Вершины с данным именем нет в исходом графе"
                    }
                })
                return true;
            }
        }

        tree.checkWeigth = function (error, real, input) {
            console.log("checkWeigth (TreeGenerate.js): проверка веса вершины")
            let store = require('graphlabs.core.template').store;
            if (error) {
                {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 0,
                            datetime: new Date(),
                            message: "Так как была введена ошибочная вершина, ее вес так же считается ошибочным"
                        }
                    })
                    return true;
                }
            }
            else {
                // проверяем, что введенное множество вершин соответствует рассчитанной неокрестности вершины
                // если несоответствие, то записываем ошибку
                if (real.sort().toString() == input.sort().toString()) {
                    return false
                }
                else {
                    store.dispatch({
                        type: "@@notifier/add_action",
                        payload: {
                            fee: 0,
                            datetime: new Date(),
                            message: "Введеное множество вершин неверно"
                        }
                    })
                    return true;
                }
            }
        }

        tree.addLeaf = function (_, vertexName, vertexArray) {
            console.log("addLeaf (TreeGenerate.js): добавляем новую вершину в дерево")
            function addLeaf(t, name) {
                if (t.v == _) {
                    let vError = tree.checkVertex(t, vertexName)
                    t.c.push({
                        v: tree.size++,
                        l: vertexName,
                        graph: TaskGraph.getSubgraph(vertexArray, t.graph),
                        realWeight: TaskGraph.getNonNeighbours(vertexName, t.graph),
                        inputWeight: vertexArray,
                        vertexError: vError,
                        weightError: tree.checkWeigth(vError, TaskGraph.getNonNeighbours(vertexName, t.graph), vertexArray),
                        p: {},
                        c: []
                    });
                    return;
                }
                t.c.forEach(e => addLeaf(e, name));
            }

            addLeaf(tree.vis, vertexName);
            reposition(tree.vis, vertexName);
            redraw(tree.size, tree.active);
        }

        tree.gracefulLabels = function () {
            console.log("gracefulLabels (TreeGenerate.js)")
            tree.glabels = []
            let v = tree.getVertices();
            let vlbls = [], elbls = [];
            let gracefulLbl = function (c) {
                if (c == tree.size) {
                    let lbl = {
                        lbl: vlbls.map(function (_) {
                            return _;
                        })
                    };
                    relabel(lbl);
                    let incMatx = tree.incMatx.map(function (_) {
                        return _;
                    });
                    if ((tree.incMatx[0] & 2) >> 1 == 1 && tree.glabels.every(function (d) {
                        return d.incMatx.toString() != incMatx.toString();
                    })) {
                        lbl.incMatx = incMatx;
                        tree.glabels.push(lbl);
                    }
                    return;
                }
                d3.range(0, tree.size)
                    .filter(function (d) {
                        return (vlbls.indexOf(d) == -1) && (elbls.indexOf(Math.abs(vlbls[v[c].f.v] - d)) == -1);
                    })
                    .forEach(function (d) {
                        vlbls[c] = d;
                        elbls[c] = Math.abs(vlbls[v[c].f.v] - d);
                        gracefulLbl(c + 1);
                        delete vlbls[c];
                        delete elbls[c];
                    });
            }
            d3.range(0, tree.size).forEach(function (d) {
                vlbls = [d];
                elbls = [];
                gracefulLbl(1);
            });
            tree.showLabel(1);
            d3.select("#labelpos").text(tree.currLbl + '/' + tree.glabels.length);
            d3.select("#labelnav").style('visibility', 'visible');
        }

        tree.showLabel = function (i) {
            console.log("showLabel (TreeGenerate.js): всплывающая подсказка")
            if (i > tree.glabels.length || i < 1) {
                alert('invalid label position');
                return;
            }

            relabel(tree.glabels[i - 1]);
            redraw();
            tree.currLbl = i;
            d3.select("#labelpos").text(tree.currLbl + '/' + tree.glabels.length);
        }

        let relabel = function (lbl) {
            console.log("relabel (TreeGenerate.js): перезагрузка всплывающих подсказок")
            function relbl(t) {
                t.l = lbl.lbl[t.v];
                t.c.forEach(relbl);
            }

            relbl(tree.vis);
            tree.incMatx = lbl.incMatx;
        }

        let redraw = function (size, active) {
            console.log("redraw (TreeGenerate.js): перерисовка дерева")

            let edges = d3.select("#g_lines").selectAll('line').data(tree.getEdges());

            edges.transition().duration(500)
                .attr('x1', function (d) {
                    return d.p1.x;
                }).attr('y1', function (d) {
                return d.p1.y;
            })
                .attr('x2', function (d) {
                    return d.p2.x;
                }).attr('y2', function (d) {
                return d.p2.y;
            })

            edges.enter().append('line')
                .attr('x1', function (d) {
                    return d.p1.x;
                }).attr('y1', function (d) {
                return d.p1.y;
            })
                .attr('x2', function (d) {
                    return d.p1.x;
                }).attr('y2', function (d) {
                return d.p1.y;
            })
                .transition().duration(500)
                .attr('x2', function (d) {
                    return d.p2.x;
                }).attr('y2', function (d) {
                return d.p2.y;
            });

            edges.exit().remove();

            let circles = d3.select("#g_circles").selectAll('circle').data(tree.getVertices());

            circles.transition().duration(500).attr('cx', function (d) {
                return d.p.x;
            }).attr('cy', function (d) {
                return d.p.y;
            })
                .attr('class', (d) => {
                    let v = tree.findVertice(d.v);
                    return v.vertexError ? (v.v == tree.active ? 'activeError' : 'error') : (v.v == tree.active ? 'active' : "")
                });
            circles.append('title').text((d) => tree.findVertice(d.v).inputWeight);

            let temp = circles.enter().append('circle').attr('cx', function (d) {
                return d.f.p.x;
            }).attr('cy', function (d) {
                return d.f.p.y;
            }).attr('r', vRad)
                .on('click', function (d) {
                    return tree.changeActive(d.v);
                })
            temp.append('title').text((d) => tree.findVertice(d.v).inputWeight);
            temp.transition().duration(500).attr('cx', function (d) {
                return d.p.x;
            }).attr('cy', function (d) {
                return d.p.y;
            })
                .attr('class', (d) => {
                    let v = tree.findVertice(d.v);
                    return v.vertexError ? (v.v == tree.active ? 'activeError' : 'error') : (v.v == tree.active ? 'active' : "")
                })

            circles.exit().remove();

            let labels = d3.select("#g_labels").selectAll('text').data(tree.getVertices());

            labels.text(function (d) {
                return d.l;
            }).transition().duration(500)
                .attr('x', function (d) {
                    return d.p.x;
                }).attr('y', function (d) {
                return d.p.y + 5;
            });
            labels.append('title').text((d) => tree.findVertice(d.v).inputWeight);

            temp = labels.enter().append('text').attr('x', function (d) {
                return d.f.p.x;
            }).attr('y', function (d) {
                return d.f.p.y + 5;
            })
                .text(function (d) {
                    return d.l;
                }).on('click', function (d) {
                    return tree.changeActive(d.v);
                })
            temp.transition().duration(500)
                .attr('x', function (d) {
                    return d.p.x;
                }).attr('y', function (d) {
                return d.p.y + 5;
            })
            temp.append('title').text((d) => tree.findVertice(d.v).inputWeight);

            labels.exit().remove();
        }

        let getLeafCount = function (_) {
            console.log("getLeafCount (TreeGenerate.js): получаем порядок вершины")

            if (_.c.length == 0) return 1;
            else return _.c.map(getLeafCount).reduce(function (a, b) {
                return a + b;
            });
        }

        let reposition = function (v) {
            console.log("reposition (TreeGenerate.js): перезаписываем позиции вершин")
            let lC = getLeafCount(v), left = v.p.x - tree.w * (lC - 1) / 2;
            v.c.forEach(function (d) {
                let w = tree.w * getLeafCount(d);
                left += w;
                d.p = {x: left - (w + tree.w) / 2, y: v.p.y + tree.h};
                reposition(d);
            });
        }

        let initialize = function () {
            console.log("initialize (TreeGenerate.js): инициализация дерева")

            d3.select("#my-canvas").append("div").attr('id', 'navdiv');

            d3.select("#navdiv").append("button").attr('type', 'button').text('+')
                .on('click', function () {
                    return tree.inputAndCheck();
                });

            d3.select("#navdiv").append("button").attr('type', 'button').text('-')
                .on('click', function () {
                    return tree.removeLeaf(tree.active);
                });

            d3.select("#my-canvas").append("svg").attr("width", svgW + "%").attr("height", svgH + "%").attr('id', 'treesvg').attr('viewBox', "0 0 600 600");

            d3.select("#treesvg").append('g').attr('id', 'g_lines').selectAll('line').data(tree.getEdges()).enter().append('line')
                .attr('x1', function (d) {
                    return d.p1.x;
                }).attr('y1', function (d) {
                return d.p1.y;
            })
                .attr('x2', function (d) {
                    return d.p2.x;
                }).attr('y2', function (d) {
                return d.p2.y;
            });

            d3.select("#treesvg").append('g').attr('id', 'g_circles').selectAll('circle').data(tree.getVertices()).enter()
                .append('circle').attr('cx', function (d) {
                return d.p.x;
            }).attr('cy', function (d) {
                return d.p.y;
            }).attr('r', vRad)
                .on('click', function (d) {
                    return tree.changeActive(d.v);
                })
                .append('title').text((d) => tree.findVertice(d.v).inputWeight);

            d3.select("#treesvg").append('g').attr('id', 'g_labels').selectAll('text').data(tree.getVertices()).enter().append('text')
                .attr('x', function (d) {
                    return d.p.x;
                }).attr('y', function (d) {
                return d.p.y + 5;
            }).text(function (d) {
                return d.l;
            })
                .on('click', function (d) {
                    return tree.changeActive(d.v);
                })
                .append('title').text((d) => tree.findVertice(d.v).inputWeight);
        }
        initialize();
        this.tree = tree;
    }

}
