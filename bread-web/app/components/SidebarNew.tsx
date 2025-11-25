'use client'

import React from 'react'
import { LucideIcon } from './LucideIcon'
import { useToggle } from '../hooks/useToggle'


/* TODO: sidebar ABSOLUTELY sucks even on ipad screens */
/* BUT: works fine on laptops and desktops */
type TabView = 'Plan' | 'Reports' | 'All Accounts'

interface SidebarProps {
  currTabView: TabView
  setTabView: React.Dispatch<React.SetStateAction<TabView>>
}

interface SidebarItemProps {
  icon: string          
  label: TabView
  isOpen: boolean
  isActive: boolean
  onClick: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isOpen,
  isActive,
  onClick,
}) => {
  const baseContainer =
    'flex items-center rounded-lg cursor-pointer transition-all ease-in-out'
  const activeClasses = isActive ? 'bg-neutral-800' : 'hover:bg-neutral-900'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseContainer} ${activeClasses} w-full text-left`}
    >
      <LucideIcon
        name={icon}
        className={`${isActive ? 'bg-neutral-800' : 'hover:bg-neutral-900'} rounded-lg transition-all ease-in-out`}
      />
      <span
        className={[
          'h-fit w-fit overflow-hidden whitespace-nowrap',
          'transition-all duration-200 ease-in-out',
          isOpen ? 'opacity-100 ml-2' : 'opacity-0 ml-0',
        ].join(' ')}
      >
        {label}
      </span>
    </button>
  ) 
}

interface SidebarDropdownProps {
  label: string
  isParentOpen: boolean
}

const SidebarDropdown: React.FC<SidebarDropdownProps> = ({
  label,
  isParentOpen,
}) => {
  const { value: isOpen, toggle } = useToggle(false)

  // When sidebar fully closed, hide content and disable pointer events
  const containerVisibility = isParentOpen
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'

  return (
    <div className={`transition-opacity duration-200 ${containerVisibility}`}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center hover:bg-neutral-800 rounded-lg transition-all cursor-pointer select-none w-full"
      >
        <LucideIcon
          name="chevron-right"
          className={`${isOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-200 ease-in-out`}
        />
        <span className="h-fit w-fit overflow-hidden whitespace-nowrap ml-2">
          {label}
        </span>
      </button>

      <div
        className={[
          'overflow-hidden transition-[max-height,opacity] duration-300',
          isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 ease-in',
        ].join(' ')}
      >
        <button
          type="button"
          className="flex justify-between items-center hover:bg-neutral-900 rounded-lg cursor-pointer w-full px-1 py-1"
        >
          <div className="flex items-center rounded-lg">
            <LucideIcon name="dot" />
            <span className="text-sm ml-2">Wallet</span>
          </div>
          <span className="text-sm p-2.5">90000</span>
        </button>
      </div>
    </div>
  )
}

const SidebarHeader: React.FC<{
  isOpen: boolean
  onToggle: () => void
}> = ({ isOpen, onToggle }) => {
  return (
    <div className="relative flex items-center rounded-lg transition-all ease-in-out">
      {/* cake icon */}
      <LucideIcon
        className="hover:bg-neutral-800 rounded-lg transition-all ease-in-out cursor-pointer"
        name="cake-slice"
      />

      {/* hide when sidebar open */} 
      <LucideIcon
        onClick={onToggle}
        className={[
          'right-0 absolute hover:bg-neutral-800 rounded-lg',
          'transition-all ease-in-out cursor-pointer',
          isOpen ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        name="panel-left"
      />

      {/* show when sidebar collapsed */}
      <LucideIcon
        onClick={!isOpen ? onToggle : undefined}
        className={[
            'left-0 absolute hover:bg-neutral-800 rounded-lg',
            'transition-all ease-in-out cursor-pointer',
            'hover:opacity-100 opacity-0',
        ].join(' ')}
        name={isOpen ? 'cake-slice' : 'panel-left'}
      />
    </div>
  )
}

const SidebarNew: React.FC<SidebarProps> = ({ currTabView, setTabView }) => {
  const { value: isOpen, toggle: toggleSidebar } = useToggle(false)

  const containerBase = 'bg-neutral-950 min-w-16 max-w-xs h-full border-r border-neutral-800 flex flex-col gap-1 p-2.5 select-none overflow-hidden transition-all duration-250 ease-out'
  const widthClasses = isOpen ? 'w-xs' : 'w-16'

  return (
    <aside className={`${containerBase} ${widthClasses}`}>
      <SidebarHeader isOpen={isOpen} onToggle={toggleSidebar} />

      <hr className="mb-2 text-neutral-700" />

      <nav className="flex flex-col gap-1">
        <SidebarItem
          icon="calendar"
          label="Plan"
          isOpen={isOpen}
          isActive={currTabView === 'Plan'}
          onClick={() => setTabView('Plan')}
        />
        <SidebarItem
          icon="chart-no-axes-column"
          label="Reports"
          isOpen={isOpen}
          isActive={currTabView === 'Reports'}
          onClick={() => setTabView('Reports')}
        />
        <SidebarItem
          icon="landmark"
          label="All Accounts"
          isOpen={isOpen}
          isActive={currTabView === 'All Accounts'}
          onClick={() => setTabView('All Accounts')}
        />
      </nav>

      <section className="mt-2 flex flex-col gap-1">
        <SidebarDropdown label="Cash" isParentOpen={isOpen} />
        <SidebarDropdown label="Investments" isParentOpen={isOpen} />
      </section>
    </aside>
  )
}

export default SidebarNew