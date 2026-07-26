import { useState, useMemo } from 'react'
import { Search, X, ArrowUp, ArrowDown, Replace } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface SearchBarProps {
  visible: boolean
  onClose: () => void
  content: string
  onReplace: (search: string, replacement: string) => void
}

export function SearchBar({ visible, onClose, content, onReplace }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [replacement, setReplacement] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showReplace, setShowReplace] = useState(false)

  const matches = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    const indices: number[] = []
    let i = -1
    while ((i = content.toLowerCase().indexOf(q, i + 1)) !== -1) {
      indices.push(i)
    }
    return indices
  }, [content, query])

  const matchCount = matches.length

  const goToNext = () => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % matches.length)
    }
  }

  const goToPrev = () => {
    if (matches.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length)
    }
  }

  const handleReplace = () => {
    onReplace(query, replacement)
  }

  if (!visible) return null

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface/80 text-xs">
      <Search size={14} className="text-text-muted shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setCurrentIndex(0) }}
        placeholder="Search..."
        className="flex-1 bg-bg-primary border border-border rounded px-2 py-1 text-text-primary text-xs outline-none focus:border-primary"
        autoFocus
      />
      {matchCount > 0 && (
        <span className="text-text-muted whitespace-nowrap">
          {currentIndex + 1}/{matchCount}
        </span>
      )}
      <button onClick={goToPrev} className="p-0.5 text-text-secondary hover:text-text-primary" aria-label="Previous match">
        <ArrowUp size={14} />
      </button>
      <button onClick={goToNext} className="p-0.5 text-text-secondary hover:text-text-primary" aria-label="Next match">
        <ArrowDown size={14} />
      </button>
      <button
        onClick={() => setShowReplace(!showReplace)}
        className={cn('p-0.5 rounded', showReplace ? 'text-primary' : 'text-text-secondary hover:text-text-primary')}
        aria-label="Toggle replace"
      >
        <Replace size={14} />
      </button>
      <button onClick={onClose} className="p-0.5 text-text-secondary hover:text-text-primary" aria-label="Close search">
        <X size={14} />
      </button>
      {showReplace && (
        <div className="flex items-center gap-1 ml-2">
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replace..."
            className="w-28 bg-bg-primary border border-border rounded px-2 py-1 text-text-primary text-xs outline-none focus:border-primary"
          />
          <button onClick={handleReplace} className="px-2 py-1 rounded bg-primary text-white text-xs hover:bg-accent-hover">
            Replace
          </button>
        </div>
      )}
    </div>
  )
}
