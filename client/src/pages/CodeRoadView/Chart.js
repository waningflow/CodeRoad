import { select, event } from 'd3'
import { hierarchy, cluster } from 'd3-hierarchy'

const margin = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
}

function tree(data) {
  const root = hierarchy(data)
  root.sort(
    (a, b) => a.height - b.height || a.data.name.localeCompare(b.data.name)
  )
  root.dx = 25
  // root.dy = width / (root.height + 1)
  root.dy = 200
  return cluster().nodeSize([root.dx, root.dy])(root)
}

export function clusterChart(domsvg, data) {
  const root = tree(data)
  console.log(root)
  let x0 = Infinity
  let x1 = -x0
  root.each(d => {
    if (d.x > x1) x1 = d.x
    if (d.x < x0) x0 = d.x
  })

  const svg = select(domsvg)
    .style('width', '100%')
    .style('height', 'auto')

  const g = svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 10)
    .attr('transform', `translate(${root.dy / 3},${root.dx - x0})`)

  g.append('g')
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

export function collapseClusterChart(domsvg, data, size) {
  const {width, height} = size
  const root = tree(data)
  console.log(root)

  // root.x0 = root.dy / 2
  // root.y0 = 0
  root.descendants().forEach((d, i) => {
    d.id = i
    d._children = d.children
    if (d.depth ) d.children = null
  })

  const svg = select(domsvg)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [-margin.left, -margin.top, width, height])
    .append('g')
    .style('font', '14px sans-serif')
    .style('user-select', 'none')
    .attr('transform', `translate(${root.dy},${height/2})`)

  const gLink = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 0.5)

  const gNode = svg.append('g').attr('cursor', 'pointer')

  function update(source) {
    const duration = event && event.altKey ? 2500 : 250
    cluster().nodeSize([root.dx, root.dy])(root)
    const nodes = root.descendants()
    const links = root.links()

    let left = root
    let right = root
    root.eachBefore(node => {
      if (node.x < left.x) left = node
      if (node.x > right.x) right = node
    })

    const height = right.x - left.x + margin.top + margin.bottom

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
      .attr('x', d => (d._children ? -6 : 6))
      .attr('text-anchor', d => (d._children ? 'end' : 'start'))
      .text(d => d.data.name)
      .clone(true)
      .lower()

    // Transition nodes to their new position.
    const nodeUpdate = node
      .merge(nodeEnter)
      .transition(transition)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('fill-opacity', 1)
      .attr('stroke-opacity', 1)

    // Transition exiting nodes to the parent's new position.
    const nodeExit = node
      .exit()
      .remove()
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)

    // Update the links…
    const link = gLink.selectAll('path').data(links, d => d.target.id)

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .append('path')
      .attr(
        'd',
        d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `
      )

    // Transition links to their new position.
    link
      .merge(linkEnter)
      .transition(transition)
      .attr(
        'd',
        d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `
      )

    // Transition exiting nodes to the parent's new position.
    link
      .exit()
      // .transition(transition)
      .remove()
      .attr(
        'd',
        d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `
      )

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x
      d.y0 = d.y
    })
  }

  update(root)

  return svg.node()
}
