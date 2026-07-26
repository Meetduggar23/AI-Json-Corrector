import { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, Braces, List } from 'lucide-react'
import { cn } from '@/utils/helpers'
import { parseJsonTree, searchNodes } from '@/utils/parser'
import type { JsonNode } from '@/types/json'

interface JsonTreeProps {
  json: string
  searchQuery?: string
}

export function JsonTree({ json, searchQuery = '' }: JsonTreeProps) {
  const tree = useMemo(() => parseJsonTree(json), [json])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']))

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const expandAll = () => {
    const paths = new Set<string>()
    const collect = (node: JsonNode) => {
      paths.add(node.path)
      node.children?.forEach(collect)
    }
    if (tree) collect(tree)
    setExpandedPaths(paths)
  }

  const collapseAll = () => {
    setExpandedPaths(new Set(['root']))
  }

  const highlightedNodes = useMemo(() => {
    if (!searchQuery || !tree) return new Set<string>()
    const results = searchNodes(tree, searchQuery, true)
    return new Set(results.map((n) => n.path))
  }, [tree, searchQuery])

  if (!tree) return <div className="text-text-muted text-[11px] p-2">Invalid JSON — no tree available</div>

  const renderNode = (node: JsonNode, depth: number) => {
    const isExpanded = expandedPaths.has(node.path)
    const isHighlighted = highlightedNodes.has(node.path)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.path}>
        <div
          className={cn(
            'flex items-center gap-1 py-0.5 pr-2 text-xs cursor-pointer hover:bg-border/20 transition-colors',
            isHighlighted && 'bg-accent/10'
          )}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          onClick={() => hasChildren && toggleExpand(node.path)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={11} className="text-text-muted shrink-0" /> : <ChevronRight size={11} className="text-text-muted shrink-0" />
          ) : (
            <span className="w-[11px] shrink-0" />
          )}
          {node.key !== 'root' && (
            <span className="text-accent shrink-0">"{node.key}"</span>
          )}
          {node.type === 'object' && (
            <span className="text-text-muted ml-1">
              <Braces size={10} className="inline text-warning" />
              {' '}{node.children?.length} props
            </span>
          )}
          {node.type === 'array' && (
            <span className="text-text-muted ml-1">
              <List size={10} className="inline text-success" />
              {' '}{node.children?.length} items
            </span>
          )}
          {node.type === 'string' && <span className="text-tree-string ml-1 truncate">"{String(node.value).slice(0, 40)}"</span>}
          {node.type === 'number' && <span className="text-tree-number ml-1">{String(node.value)}</span>}
          {node.type === 'boolean' && <span className="text-tree-boolean ml-1">{String(node.value)}</span>}
          {node.type === 'null' && <span className="text-text-muted italic ml-1">null</span>}
        </div>
        {isExpanded && hasChildren && node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border">
        <button onClick={expandAll} className="text-[10px] text-text-secondary hover:text-text-primary">Expand</button>
        <button onClick={collapseAll} className="text-[10px] text-text-secondary hover:text-text-primary">Collapse</button>
      </div>
      <div className="py-0.5 overflow-auto max-h-full font-mono">
        {tree.children?.map((child) => renderNode(child, 0))}
      </div>
    </div>
  )
}
