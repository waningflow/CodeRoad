import React, { Component } from 'react'
import axios from 'axios'
import { clusterChart, collapseClusterChart } from './Chart'
import './CodeRoadView.css'

export default class CodeRoadView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dirTree: {},
      depCruise: {}
    }

    this.containerSvg
    this.initData()
  }

  componentDidMount() {
    // const { dirTree } = this.state
    // this.chart(this.svg, dirTree)
  }

  componentDidUpdate() {}

  async initData() {
    try {
      let [res_dir, res_dep] = await Promise.all(
        ['dirtree', 'depcruise'].map(async v => {
          let res = await axios({
            method: 'GET',
            url: `http://localhost:3450/${v}`
          })
          return res.data
        })
      )
      res_dep = res_dep.modules.reduce((pre, cur) => {
        pre[cur.source] = cur
        return pre
      }, {})
      this.setState({
        dirTree: res_dir,
        depCruise: res_dep
      })
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    const { dirTree, depCruise } = this.state
    if (this.svg && this.containerSvg) {
      let size = this.containerSvg.getBoundingClientRect()
      collapseClusterChart(this.svg, dirTree, depCruise, size)
    }
    return (
      <div className="CodeRoadMainContainer">
        <div
          className="CodeRoadMainChart"
          ref={ele => (this.containerSvg = ele)}
        >
          <svg width={600} height={600} ref={element => (this.svg = element)} />
          {/* {JSON.stringify(dirTree)} */}
        </div>
      </div>
    )
  }
}
