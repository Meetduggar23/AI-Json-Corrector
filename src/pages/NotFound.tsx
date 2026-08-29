import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/common/Button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <FileQuestion size={48} className="text-text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">404</h1>
        <p className="text-text-secondary mb-4">Page not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  )
}
