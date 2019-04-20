import { select, event, zoom } from 'd3'
import { hierarchy, cluster } from 'd3-hierarchy'

const depLevel = 10
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

export function collapseClusterChart(domsvg, dirTree, depCruise, size) {
  const { width, height } = size
  let root = hierarchy(dirTree)
  root.sort(
    (a, b) => a.height - b.height || a.data.name.localeCompare(b.data.name)
  )
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

  const svg = select(domsvg)
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
  // .call(zoom)

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

  let depCount = 0
  let depNodeIn = []
  let hoverNode = null

  function update() {
    const duration = event && event.altKey ? 2500 : 250
    cluster().nodeSize([root.dx, root.dy])(root)
    const nodes = root.descendants()
    const links = root.links()

    const transition = svg
      .transition()
      .duration(duration)
      .tween(
        'resize',
        window.ResizeObserver ? null : () => () => svg.dispatch('toggle')
      )

    // Update the nodes…
    const node = gNode.selectAll('g').data(nodes, d => d.id)

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .on('click', d => {
        d.children = d.children ? null : d._children
        // console.log(d.data.path)
        // let nodeInfo = depCruise[d.data.path]
        // console.log(nodeInfo)
        let edgeNodes = root.descendants().filter(v => !v.children)
        // console.log(edgeNodes)
        depCount = 0
        depNodeIn = []
        let depLinks = getDepLinks(edgeNodes, d, depLevel)
        root.depLinks = depLinks
        console.log(root.depLinks)
        // console.log(dep_nodes)
        update(d)
      })
      .on('mouseover', d => {
        hoverNode = d.data.path
        update(d)
      })
      .on('mouseout', d => {
        hoverNode = null
        update(d)
      })

    nodeEnter
      .append('circle')
      .attr('r', 2.5)
      .attr('fill', d => (d._children ? '#555' : '#999'))

    nodeEnter
      .append('text')
      .attr('dy', '0.31em')
      .attr('fill', '#fff')
      // .attr('x', d => (d._children ? -6 : 6))
      // .attr('text-anchor', d => (d._children ? 'end' : 'start'))
      .attr('text-anchor', 'end')
      .attr('x', -6)
      .text(d => d.data.name)
      .clone(true)
      .lower()

    // Transition nodes to their new position.
    node
      .merge(nodeEnter)
      .transition(transition)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // Transition exiting nodes to the parent's new position.
    node
      .exit()
      .remove()
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    // Update the links…
    const link = gLink.selectAll('path').data(links, d => d.target.id)

    const linkEnter = link
      .enter()
      .append('path')
      .attr('d', d => linkPath(d))

    link
      .merge(linkEnter)
      .transition(transition)
      .attr('d', d => linkPath(d))

    link
      .exit()
      .remove()
      .attr('d', d => linkPath(d))

    const depLink = gDepLink
      .selectAll('path')
      .data(root.depLinks || [], d => d.target.id)

    const depLinkEnter = depLink
      .enter()
      .append('path')
      .attr('d', d => depLinkPath(d))
      .attr('stroke', d =>
        hoverNode === d.source.data.path ? '#fff' : colorList[d.depCount]
      )
    // .append('path')
    // .attr('d', d=> arrowPath(d))

    depLink
      .merge(depLinkEnter)
      .attr('d', d => depLinkPath(d))
      .attr('stroke', d =>
        hoverNode === d.source.data.path ? '#fff' : colorList[d.depCount]
      )

    depLink.exit().remove()
    // .attr('d', d => depLinkPath(d))

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }

  function getDepLinks(edgeNodes, startNode, depLevel) {
    if (depLevel <= 1 || depNodeIn.includes(startNode.data.path)) {
      return []
    }
    depNodeIn.push(startNode.data.path)
    let depLinks = []
    let startNd = depCruise[startNode.data.path]
    depLevel -= 1
    // console.log(startNode)
    if (startNd && startNd.dependencies && startNd.dependencies.length) {
      depCount += 1
      let depNodes = []
      // let depNds = []
      startNd.dependencies.forEach(nv => {
        depNodes.push(
          edgeNodes.find(ev => nv.resolved.startsWith(ev.data.path))
        )
        // depNds.push(depCruise[nv.resolved])
      })

      console.log(depNodes)
      depLinks = depNodes.map(dv => {
        return {
          source: startNode,
          target: dv,
          level: depLevel,
          depCount: depCount
        }
      })
      // } else {
      if (depLevel > 1) {
        depNodes.forEach(dv => {
          let subDepLinks = getDepLinks(edgeNodes, dv, depLevel)
          depLinks = depLinks.concat(subDepLinks)
        })
      }
    }
    console.log(depLevel)
    return depLinks
  }

  function arrowPath(d) {
    const size = 5
    return `
      M${d.target.y + size},${d.target.x - size}
      L${d.target.y},${d.target.x}
      L${d.target.y + size},${d.target.x + size}
    `
  }

  function linkPath(d) {
    return `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${(d.target.x + d.source.x) / 2}
         ${d.source.y},${d.source.x}
      `
  }

  function depLinkPath(d) {
    let sig = Math.sign(-d.target.x + d.source.x)
    const gap = 10
    const curve = 20
    const size = 5
    return `
      M${d.source.y},${d.source.x + gap}
      C${d.source.y + 150 + d.depCount * 50},${d.source.x + gap}
       ${d.source.y + 150 + d.depCount * 50},${d.source.x + gap}
       ${d.source.y + 150 + d.depCount * 50},${d.source.x + gap - curve * sig}
      V${d.target.x + curve * sig}
      C${d.source.y + 150 + d.depCount * 50},${d.target.x}
       ${d.source.y + 150 + d.depCount * 50},${d.target.x}
       ${d.target.y},${d.target.x}
      M${d.target.y + size * 2},${d.target.x - size}
      L${d.target.y},${d.target.x}
      L${d.target.y + size * 2},${d.target.x + size}
    `
  }

  update(root)

  return svg.node()
}
