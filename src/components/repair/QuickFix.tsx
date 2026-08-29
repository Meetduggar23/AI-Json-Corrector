import {
  Quote, CornerDownRight, RemoveFormatting, FileX2,
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useRepair } from '@/hooks/useRepair'

const fixes = [
  { id: 'quotes', icon: Quote, label: 'Add Quotes', desc: 'Missing quotes on keys', variant: 'primary' as const },
  { id: 'comma', icon: CornerDownRight, label: 'Insert Comma', desc: 'Missing commas', variant: 'success' as const },
  { id: 'trailing', icon: RemoveFormatting, label: 'Remove Trailing', desc: 'Trailing commas', variant: 'warning' as const },
  { id: 'invalid', icon: FileX2, label: 'Remove Invalid', desc: 'Invalid characters', variant: 'danger' as const },
]

export function QuickFix() {
  const { applyQuickFix } = useRepair()

  return (
    <div className="grid grid-cols-1 gap-2 p-3">
      {fixes.map((fix) => {
        const Icon = fix.icon
        return (
          <Button
            key={fix.id}
            variant={fix.variant}
            size="sm"
            className="justify-start h-10"
            icon={<Icon size={15} strokeWidth={1.75} />}
            onClick={() => applyQuickFix(fix.id)}
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-medium">{fix.label}</span>
              <span className="text-[9px] opacity-70">{fix.desc}</span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
