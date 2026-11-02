import tree from '../data/key.json'

const cache = new Map()

// species ids reachable from a node. the returned set is shared, do not modify it
// plain walk with a seen set: the key has loops (p28 sends back to p27)
export function reachableSpecies(nodeId) {
  if (cache.has(nodeId)) return cache.get(nodeId)
  const found = new Set()
  const seen = new Set()
  const stack = [nodeId]
  while (stack.length) {
    const id = stack.pop()
    if (seen.has(id)) continue
    seen.add(id)
    for (const choice of tree.nodes[id]?.choices ?? []) {
      if (choice.species) found.add(choice.species)
      if (choice.next) stack.push(choice.next)
    }
  }
  cache.set(nodeId, found)
  return found
}

// targets are prefixed ("n:" node, "s:" species) so ids can never clash
let reverse

function reverseEdges() {
  if (reverse) return reverse
  reverse = new Map()
  for (const [node, { choices }] of Object.entries(tree.nodes)) {
    for (const { label, next, species } of choices) {
      const to = next ? 'n:' + next : 's:' + species
      if (!reverse.has(to)) reverse.set(to, [])
      reverse.get(to).push({ node, label, to })
    }
  }
  return reverse
}

// shortest path from the start to a species: [{ node, label }], or null if unreachable
export function pathTo(speciesId) {
  const edges = reverseEdges()
  const step = new Map() // node id -> edge to take from that node
  const queue = ['s:' + speciesId]
  for (let i = 0; i < queue.length && !step.has(tree.start); i++) {
    for (const edge of edges.get(queue[i]) ?? []) {
      if (step.has(edge.node)) continue
      step.set(edge.node, edge)
      queue.push('n:' + edge.node)
    }
  }

  const path = []
  let edge = step.get(tree.start)
  while (edge) {
    path.push({ node: edge.node, label: edge.label })
    edge = edge.to.startsWith('n:') ? step.get(edge.to.slice(2)) : null
  }
  return path.length ? path : null
}
