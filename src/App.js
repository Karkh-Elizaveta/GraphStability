import React, { Component } from 'react';
import {default as styled, StyledFunction } from 'styled-components';
import {TaskTemplate, TaskToolbar, ToolButtonList} from 'graphlabs.core.template';

import './App.css';
import {Tree as _Tree} from "./TreeGenerate";

const BorderedDiv = styled.div`
  {
    box-shadow:2px 2px 11px rgba(0, 0, 0, 0.5);
    -webkit-box-shadow:2px 2px 11px rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    background: #fffaf0;
  }
`;

const GraphCell = BorderedDiv.extend`
  {
    position: fixed;
    left: 15%;
    top: 1%;
    width: 62%;
    height: 78%;
  }
`;

const ToolCell = BorderedDiv.extend`
  {
     position: fixed;
    left: 1%;
    top: 1%;
    width: 12%;
    height: 78%;
  }
`;

const TaskCell = BorderedDiv.extend`
  {
    position: fixed;
    left: 79%;
    top: 1%;
    width: 20%;
    height: 15%;
  }
`;

const TaskCell2 = BorderedDiv.extend`
  {
    position: fixed;
    left: 79%;
    top: 17%;
    width: 20%;
    height: 62%;
  }
`;

const LeftBottom = BorderedDiv.extend`
  {
    position: fixed;
    left: 1%;
    top: 80%;
    width: 12%;
    height: 19%;
  }
`;

const LowRow =  BorderedDiv.extend`
  {
    position: fixed;
    left: 15%;
    top: 80%;
    width: 84%;
    height: 19%;
  }
`;

const App2 = styled.div`
  {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`;

const MainRow = styled.div`
  {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 80%;
  }
`;

// noinspection JSAnnotator
class App extends TaskTemplate {

    tree;

    calculate() {
        console.log("calculate (App.js)")
        let res = 10;
        return { success: res === 0, fee: res };
    }

    componentDidMount() {
        console.log("componentDidMount (App.js): создаем новое дерево")
        this.tree = new _Tree();
    }

    task() {
        console.log("task (App.js)")
        return (
            () => <div id={'my-canvas'}></div>
        )
    }

    getTaskToolbar() {
        console.log("getTaskToolbar (App.js): возвращаем панель инструментов, начало")
        TaskToolbar.prototype.getButtonList = () => {
            ToolButtonList.prototype.help = () => `В данном задании вы должны построить дерево, посадить сына и срубить дом`;
            ToolButtonList.prototype.toolButtons = {
                '+': () => {
                    if (this.tree) this.tree.addLeaf()
                },
                '-': () => {
                    if (this.tree) this.tree.removeLeaf()
                }
            }
            console.log("getTaskToolbar (App.js): возвращаем список кнопок на пенли инструментов")
            return ToolButtonList;
        };
        console.log("getTaskToolbar (App.js): возвращаем панель инструментов со всеми кнопками")
        return TaskToolbar;
    }
}

export default App;


