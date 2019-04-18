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

    this.svg
    this.getDirTree()
  }

  componentDidMount() {
    // const { dirTree } = this.state
    // this.chart(this.svg, dirTree)
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
    if (this.svg) {
      console.log(this.svg)
      collapseClusterChart(this.svg, dirTree)
    }
    return (
      <div className="CodeRoadMainContainer">
        <div className="CodeRoadMainChart">
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
