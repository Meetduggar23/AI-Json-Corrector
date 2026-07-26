import type { JsonNode } from '@/types/json'

export function parseJsonTree(json: string): JsonNode | null {
  try {
    const parsed = JSON.parse(json)
    return buildNode('root', parsed, 0, '')
  } catch {
    return null
  }
}

function buildNode(key: string, value: unknown, depth: number, path: string): JsonNode {
  if (value === null) {
    return { key, value: null, type: 'null', depth, path }
  }
  if (typeof value === 'string') {
    return { key, value, type: 'string', depth, path }
  }
  if (typeof value === 'number') {
    return { key, value, type: 'number', depth, path }
  }
  if (typeof value === 'boolean') {
    return { key, value, type: 'boolean', depth, path }
  }
  if (Array.isArray(value)) {
    const children = value.map((item, index) =>
      buildNode(String(index), item, depth + 1, `${path}[${index}]`)
    )
    return { key, value, type: 'array', depth, path, children }
  }
  if (typeof value === 'object') {
    const children = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      buildNode(k, v, depth + 1, `${path}.${k}`)
    )
    return { key, value, type: 'object', depth, path, children }
  }
  return { key, value: String(value), type: 'string', depth, path }
}

export function getNodeValue(node: JsonNode): string {
  switch (node.type) {
    case 'null': return 'null'
    case 'string': return `"${node.value}"`
    default: return String(node.value)
  }
}

export function findNodeByPath(tree: JsonNode, path: string): JsonNode | null {
  if (tree.path === path) return tree
  if (!tree.children) return null
  for (const child of tree.children) {
    const found = findNodeByPath(child, path)
    if (found) return found
  }
  return null
}

export function searchNodes(tree: JsonNode, query: string, inValues = false): JsonNode[] {
  const results: JsonNode[] = []
  const search = (node: JsonNode) => {
    if (node.key.toLowerCase().includes(query.toLowerCase())) results.push(node)
    if (inValues && typeof node.value === 'string' && node.value.toLowerCase().includes(query.toLowerCase())) {
      if (!results.includes(node)) results.push(node)
    }
    node.children?.forEach(search)
  }
  search(tree)
  return results
}
