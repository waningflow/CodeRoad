import { select, event, zoom } from 'd3'
import { hierarchy, cluster } from 'd3-hierarchy'

export function collapseClusterChart(domsvg, data, size) {
  const { width, height } = size
  let root = hierarchy(data)
  root.sort(
    (a, b) => a.height - b.height || a.data.name.localeCompare(b.data.name)
  )
  root.dx = 25
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
    .attr('stroke-width', 0.5)

  const gNode = svg.append('g').attr('cursor', 'pointer')

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
        console.log(d.data.name)
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
