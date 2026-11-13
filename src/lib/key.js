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
    choices.forEach(({ label, next, species }, index) => {
      const to = next ? 'n:' + next : 's:' + species
      if (!reverse.has(to)) reverse.set(to, [])
      reverse.get(to).push({ node, index, label, to })
    })
  }
  return reverse
}

// shortest path from the start to a species: [{ node, index, label }], or null if unreachable
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
    path.push({ node: edge.node, index: edge.index, label: edge.label })
    edge = edge.to.startsWith('n:') ? step.get(edge.to.slice(2)) : null
  }
  return path.length ? path : null
}

// questions left before a species: the typical (median) number from this node, counting the
// answer that opens the species page. shortest routes, loops cannot inflate it
export function stepsLeft(nodeId) {
  const dist = new Map([[nodeId, 1]])
  const queue = [nodeId]
  const species = new Map()
  for (let i = 0; i < queue.length; i++) {
    const d = dist.get(queue[i])
    for (const choice of tree.nodes[queue[i]]?.choices ?? []) {
      if (choice.species && !species.has(choice.species)) species.set(choice.species, d)
      if (choice.next && !dist.has(choice.next)) {
        dist.set(choice.next, d + 1)
        queue.push(choice.next)
      }
    }
  }
  const sorted = [...species.values()].sort((a, b) => a - b)
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
}

// the path lives in the url: ?chemin=p03.2,p03-voile.0 (node id, index of the chosen answer)
export const trailQuery = (steps) => (steps.length ? '?chemin=' + steps.map((s) => `${s.node}.${s.index}`).join(',') : '')

// steps leading to nodeId, read back from the end. a step that does not exist or does not lead on is dropped with all before it
export function parseTrail(param, nodeId) {
  const trail = []
  let expected = nodeId
  for (const text of (param ?? '').split(',').reverse()) {
    const [node, index] = [text.slice(0, text.lastIndexOf('.')), Number(text.slice(text.lastIndexOf('.') + 1))]
    const choice = tree.nodes[node]?.choices[index]
    if (!choice || choice.next !== expected) break
    trail.unshift({ node, index })
    expected = node
  }
  return trail
}
