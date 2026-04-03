import React, { createContext } from 'react'

const DropdownContext = createContext<{
  open: boolean,
  setOpen: (v: boolean) => void
} | null>(null)

const Dropdown = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div
        className='absolute z-10 bg-neutral-900 flex flex-col rounded-lg border border-neutral-800'
      >
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export default Dropdown