'use client'
import { createContext, useState } from "react"

type SelectContextType = {
  value: string
  onChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SelectContext = createContext<SelectContextType | null>(null)

type SelectRootProps = {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}

export const SelectRoot = ({ value, onChange, children }: SelectRootProps) => {
  const [open, setOpen] = useState(false)

  return (
    <SelectContext.Provider value={{ value, onChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  )
}