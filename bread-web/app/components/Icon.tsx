import Image from "next/image"
// import { DynamicIcon } from 'lucide-react/dynamic'

export const Icon = ({ name = '', className = '', iconSize = 24, onClick }: { name?: string, className?: string, iconSize?: number, onClick?: () => void }) => {
  return (
    <div onClick={onClick} className={`p-2.5 ${className}`}>
      <div style={{ width: iconSize, height: iconSize }}>
        {name.trim()
          ? <Image src={`/${name}.svg`} alt={`${name} icon`} width={iconSize} height={iconSize} />
          // ? <DynamicIcon color="#e5e5e5" name={name as any} size={24} />
          : null}
      </div>
    </div>
  )
}