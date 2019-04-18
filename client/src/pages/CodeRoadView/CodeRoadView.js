import React, { Component } from 'react'
import axios from 'axios'
import {clusterChart, collapseClusterChart} from './Chart'
import './CodeRoadView.css'

export default class CodeRoadView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dirTree: {}
    }

    this.containerSvg
    this.svg
    this.getDirTree()
  }

  componentDidMount() {
    // const { dirTree } = this.state
    // this.chart(this.svg, dirTree)
  }

  componentDidUpdate(){

  }

  async getDirTree() {
    let options = {
      method: 'get',
      url: 'http://localhost:3450/data'
    }
    let res = await axios(options)
    this.setState({
      dirTree: res.data
    })
  }

  render() {
    const { dirTree } = this.state
    if (this.svg && this.containerSvg) {
      let size = this.containerSvg.getBoundingClientRect()
      collapseClusterChart(this.svg, dirTree, size)
    }
    return (
      <div className="CodeRoadMainContainer">
        <div className="CodeRoadMainChart" ref={ele => this.containerSvg = ele}>
          <svg
            width={600}
            height={600}
            ref={element => (this.svg = element)}
          />
          {/* {JSON.stringify(dirTree)} */}
        </div>
      </div>
    )
  }
}
