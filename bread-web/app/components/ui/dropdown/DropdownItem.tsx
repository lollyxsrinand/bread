import React from "react"

const DropdownItem = ({children, onClick}: { children: React.ReactNode, onClick?: () => void }) => {
  return (
    <div 
    onClick={onClick}
    className="px-2 py-1 hover:bg-neutral-800 cursor-pointer">
        {children}
    </div>
  )
}

export default DropdownItem