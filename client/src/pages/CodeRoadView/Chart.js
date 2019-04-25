import { select, event, zoom } from 'd3'
import { hierarchy, cluster } from 'd3-hierarchy'

const colorList = [
  '#058DC7',
  '#50B432',
  '#ED561B',
  '#DDDF00',
  '#24CBE5',
  '#64E572',
  '#FF9655',
  '#FFF263',
  '#6AF9C4'
]

export default class ChartController {
  constructor(props) {
    const { domsvg, dirTree, depCruise, size, depLevel } = props
    this.domsvg = domsvg
    this.dirTree = dirTree
    this.depCruise = depCruise
    this.size = size
    this.depLevel = depLevel || 3

    this.root = null
    this.svg = null
    this.gLink = null
    this.gNode = null
    this.gDepLink = null

    this.depCount = 0
    this.depNodeIn = []
    this.hoverNode = null
    this.startNode = null

    this.startFileLocked = false

    this.eventPool = {}
  }

  initCollapseClusterChart() {
    const { width, height } = this.size
    let root = hierarchy(this.dirTree)
    root.sort((a, b) => {
      // return a.height - b.height || a.data.name.localeCompare(b.data.name)
      return a.data.dependencies.length - b.data.dependencies.length
    })
    root.dx = 50
    root.dy = 200

    root.x0 = height / 2
    root.y0 = root.dy
    cluster().nodeSize([root.dx, root.dy])(root)
    console.log(root)

    root.descendants().forEach((d, i) => {
      d.id = i
      d._children = d.children
      if (d.depth >= 1) d.children = null
    })

    const svg = select(this.domsvg)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .call(
        zoom()
          .scaleExtent([0.3, 3])
          .on('zoom', function() {
            svg.attr('transform', event.transform)
            svg.attr(
              'transform',
              'translate(' +
                (event.transform.x + event.transform.k * root.dy) +
                ',' +
                (event.transform.y + (event.transform.k * height) / 2) +
                ') scale(' +
                event.transform.k +
                ')'
            )
          })
      )
      .append('g')
      .style('font', '14px sans-serif')
      .style('user-select', 'none')
      .attr('transform', `translate(0,0)`)
      .attr('transform', `translate(${root.dy},${height / 2})`)

    const gLink = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)

    const gNode = svg.append('g').attr('cursor', 'pointer')

    const gDepLink = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)

    this.root = root
    this.svg = svg
    this.gLink = gLink
    this.gNode = gNode
    this.gDepLink = gDepLink

    this.update()

    return svg.node()
  }

  updateDepLevel(level = 1) {
    let l = parseInt(level)
    this.depLevel = l < 1 ? 1 : l
    console.log(this.depLevel)

    let edgeNodes = this.root.descendants().filter(v => !v.children)
    this.depCount = 0
    this.depNodeIn = []
    let depLinks = this.getDepLinks(edgeNodes, this.startNode, this.depLevel)
    this.root.depLinks = depLinks
    this.update()
  }

  lockStartFile(status) {
    this.startFileLocked = status
  }

  triggerEvent(eventType, options) {
    if (this.eventPool[eventType] && this.eventPool[eventType].length) {
      this.eventPool[eventType].forEach(fun => {
        fun.call(this, options)
      })
    }
  }

  onEvent(eventType, callback) {
    if (!this.eventPool[eventType]) {
      this.eventPool[eventType] = []
    }
    this.eventPool[eventType].push(callback)
  }

  removeEvent(eventType) {
    delete this.eventPool[eventType]
  }

  updateSize(size) {
    this.size = size
    const { width, height } = size
    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
  }

  update() {
    const self = this
    const duration = event && event.altKey ? 2500 : 250
    cluster().nodeSize([self.root.dx, self.root.dy])(self.root)
    const nodes = self.root.descendants()
    const links = self.root.links()

    const transition = self.svg.transition().duration(duration)

    // Update the nodes…
    const node = self.gNode.selectAll('g').data(nodes, d => d.id)

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', d => {
        if (!this.startFileLocked) {
          if (d.data.type === 'file') {
            self.startNode = d
          } else if (
            self.startNode &&
            self.startNode.data.path.startsWith(d.data.path)
          ) {
            self.startNode = null
          }
          d.children = d.children ? null : d._children
        } else {
          if (!self.startNode.data.path.startsWith(d.data.path)) {
            d.children = d.children ? null : d._children
          }
        }

        let edgeNodes = self.root.descendants().filter(v => !v.children)
        // console.log(edgeNodes)
        self.depCount = 0
        self.depNodeIn = []
        let depLinks = self.getDepLinks(
          edgeNodes,
          self.startNode,
          self.depLevel
        )
        self.root.depLinks = depLinks

        self.triggerEvent('clickNode', {
          clickNode: d,
          startNode: self.startNode
        })
        self.update(d)
      })
      .on('mouseover', d => {
        self.hoverNode = d.data.path
        self.update(d)
      })
      .on('mouseout', d => {
        self.hoverNode = null
        self.update(d)
      })

    nodeEnter
      .append('circle')
      .attr('r', 2.5)
      .attr('fill', d => (d._children ? '#555' : '#999'))

    nodeEnter
      .append('text')
      .attr('dy', '0.31em')
      .attr('fill', '#fff')
      .attr('text-anchor', 'end')
      .attr('x', -6)
      .text(d => d.data.name)
      .clone(true)
      .lower()

    node
      .merge(nodeEnter)
      .transition(transition)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    node
      .exit()
      .remove()
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    const link = self.gLink.selectAll('path').data(links, d => d.target.id)

    const linkEnter = link
      .enter()
      .append('path')
      .attr('d', d => self.linkPath(d))

    link
      .merge(linkEnter)
      .transition(transition)
      .attr('d', d => self.linkPath(d))

    link
      .exit()
      .remove()
      .attr('d', d => self.linkPath(d))

    const depLink = self.gDepLink
      .selectAll('path')
      .data(self.root.depLinks || [], d => d.target.id)

    const colorListLength = colorList.length
    const depLinkEnter = depLink
      .enter()
      .append('path')
      .attr('d', d => self.depLinkPath(d))
      .attr('stroke', d => colorList[(d.depCount - 1) % colorListLength])
      .attr('stroke-width', 1)
      .filter(d => self.hoverNode === d.source.data.path)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .clone(true)
      .raise()

    depLink
      .merge(depLinkEnter)
      .attr('d', d => self.depLinkPath(d))
      .attr('stroke', d => colorList[(d.depCount - 1) % colorListLength])
      .attr('stroke-width', 1)
      .filter(d => self.hoverNode === d.source.data.path)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .clone(true)
      .raise()

    depLink.exit().remove()
  }

  getDepLinks(edgeNodes, startNode, depLevel) {
    const self = this
    if (
      depLevel <= 0 ||
      !startNode ||
      self.depNodeIn.includes(startNode.data.path)
    ) {
      return []
    }
    self.depNodeIn.push(startNode.data.path)
    let depLinks = []
    let startNd = self.depCruise[startNode.data.path]
    depLevel -= 1
    // console.log(startNode)
    if (startNd && startNd.dependencies && startNd.dependencies.length) {
      self.depCount += 1
      let depNodes = []
      // let depNds = []
      startNd.dependencies.forEach(nv => {
        depNodes.push(
          edgeNodes.find(ev => nv.resolved.startsWith(ev.data.path))
        )
        // depNds.push(depCruise[nv.resolved])
      })
      depNodes = depNodes.filter(Boolean)

      // console.log(depNodes)
      depLinks = depNodes.map(dv => {
        return {
          source: startNode,
          target: dv,
          level: depLevel,
          depCount: self.depCount
        }
      })
      // } else {
      if (depLevel >= 1) {
        depNodes.forEach(dv => {
          let subDepLinks = self.getDepLinks(edgeNodes, dv, depLevel)
          depLinks = depLinks.concat(subDepLinks)
        })
      }
    }
    // console.log(depLevel)
    return depLinks
  }

  linkPath(d) {
    return `
        M${d.target.y},${d.target.x}
        C${d.source.y + this.root.dy / 2},${d.target.x}
         ${d.source.y + this.root.dy / 2},${(d.target.x + d.source.x) / 2}
         ${d.source.y},${d.source.x}
      `
  }

  depLinkPath(d) {
    let sig = Math.sign(-d.target.x + d.source.x)
    const base = 50
    const gap = 10
    const curve = 20
    const size = 5
    return `
      M${d.source.y},${d.source.x + gap}
      C${d.source.y + base + d.depCount * 50},${d.source.x + gap}
       ${d.source.y + base + d.depCount * 50},${d.source.x + gap}
       ${d.source.y + base + d.depCount * 50},${d.source.x + gap - curve * sig}
      V${d.target.x + curve * sig}
      C${d.source.y + base + d.depCount * 50},${d.target.x}
       ${d.source.y + base + d.depCount * 50},${d.target.x}
       ${d.target.y},${d.target.x}
      M${d.target.y + size * 2},${d.target.x - size}
      L${d.target.y},${d.target.x}
      L${d.target.y + size * 2},${d.target.x + size}
    `
  }
}
