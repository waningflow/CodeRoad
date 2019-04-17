import React, { Component } from 'react'
import axios from 'axios'
import * as d3 from 'd3'
import { hierarchy, cluster } from 'd3-hierarchy'

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

  chart(domsvg, data) {
    console.log(svg)
    const width = 932

    function tree(data) {
      const root = hierarchy(data).sort(
        (a, b) => a.height - b.height || a.data.name.localeCompare(b.data.name)
      )
      root.dx = 10
      root.dy = width / (root.height + 1)
      return cluster().nodeSize([root.dx, root.dy])(root)
    }
    const root = tree(data)

    let x0 = Infinity
    let x1 = -x0
    root.each(d => {
      if (d.x > x1) x1 = d.x
      if (d.x < x0) x0 = d.x
    })

    const svg = d3
      .select(domsvg)
      .style('width', '100%')
      .style('height', 'auto')

    const g = svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('transform', `translate(${root.dy / 3},${root.dx - x0})`)

    const link = g
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `
      )

    const node = g
      .append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants().reverse())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)

    node
      .append('circle')
      .attr('fill', d => (d.children ? '#555' : '#999'))
      .attr('r', 2.5)

    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d.children ? -6 : 6))
      .text(d => d.data.name)
      .filter(d => d.children)
      .attr('text-anchor', 'end')
      .clone(true)
      .lower()
      .attr('stroke', 'white')

    return svg.node()
  }

  render() {
    const { dirTree } = this.state
    if (this.svg) {
      console.log(this.svg)
      this.chart(this.svg, dirTree)
    }
    return (
      <div>
        <div>
          <svg width={600} height={1600} ref={element => (this.svg = element)} />
          {JSON.stringify(dirTree)}
        </div>
      </div>
    )
  }
}
