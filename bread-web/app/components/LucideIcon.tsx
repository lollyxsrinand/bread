import Image from "next/image"
import { DynamicIcon } from 'lucide-react/dynamic'

export const LucideIcon = ({ name = '', className = '', iconSize = 24, onClick }: { name?: string, className?: string, iconSize?: number, onClick?: () => void }) => {
  return (
    <div onClick={onClick} className={`p-2.5 ${className}`}>
        {name.trim()
          ? <DynamicIcon color="#e5e5e5" name={name as any} size={iconSize} />
          : <DynamicIcon color="#e5e5e5" name='cake-slice' size={iconSize} /> }
    </div>
  )
}