import { useNavigate } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Button } from '@/components/common/Button'

export default function NotWorking() {
  const navigate = useNavigate()
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Construction size={48} className="text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Oops!</h1>
        <p className="text-text-secondary mb-4">This feature is not working yet</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  )
}
