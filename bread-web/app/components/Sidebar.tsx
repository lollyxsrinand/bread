'use client'
import React from 'react'
import { LucideIcon } from './LucideIcon'


/* TODO: use tailwind classes, create components */
const Sidebar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // const SidebarButton = ({ icon, label }: { icon: string, label: string }) => {
  //   return (
  //     <div className='flex items-center hover:bg-neutral-800 rounded-lg cursor-pointer transition-all ease-in-out'>
  //       <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out' name={'calendar'} />
  //       <div className={`h-fit w-fit overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100':'opacity-0'} transition-all duration-200 ease-in-out`}>Plan</div>
  //     </div>
  //   )
  // }

  const Dropdown = () => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
      <div>
        <div onClick={toggleDropdown} className='flex items-center hover:bg-neutral-800 rounded-lg transition-all cursor-pointer select-none'>
          <LucideIcon name={'chevron-right'} className={`${isDropdownOpen ? 'rotate-90' : 'rotate-0'} transition-all duration-200 ease-in-out`} />
          <div className='h-fit w-fit overflow-hidden whitespace-nowrap'>Cash</div>
        </div>
        {/* {isDropdownOpen && ( */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${isDropdownOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 ease-in'
            }`}
        >
          <div className={`flex justify-between items-center hover:bg-neutral-900 rounded-lg cursor-pointer`}>
            <div className='flex items-center  rounded-lg'>
              <LucideIcon name="dot" />
              <div className='text-sm'>Wallet</div>
            </div>
            <div className='text-sm p-2.5'>90000</div>
          </div>
        </div>
        {/* )} */}
      </div>
    )
  }
  return (
    <div className={`${isOpen ? "w-xs bg-neutral-950" : "w-16 bg-neutral-900"} min-w-16 select-none max-w-xs h-full border-r border-neutral-800 flex flex-col gap-1 p-2.5 transition-all duration-250 ease-out overflow-hidden`}>
      <div className='relative flex items-center rounded-lg transition-all ease-in-out '>
        <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out cursor-pointer' name={'cake-slice'} />
        <LucideIcon onClick={toggleSidebar} className={`right-0 absolute hover:bg-neutral-800 rounded-lg transition-all ease-in-out cursor-pointer ${isOpen ? 'opacity-100' : 'opacity-0'}`} name={`panel-left`} />
        <LucideIcon onClick={!isOpen ? toggleSidebar : undefined} className={`left-0 absolute hover:bg-neutral-800 rounded-lg transition-all ease-in-out cursor-pointer hover:opacity-100 opacity-0`} name={isOpen ? 'cake-slice' : 'panel-left'} />
      </div>

      {/* <div className='flex items-center hover:bg-neutral-800 rounded-lg cursor-pointer transition-all ease-in-out'>
        <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out' name={'calendar'} />
        <div className={`h-fit w-fit overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100':'opacity-0'} transition-all duration-200 ease-in-out`}>Plan</div>
      </div> */}

      {/* <div className={`flex flex-col gap-1 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all duration-300 ease-in-out`}> */}
        {/* <SidebarButton icon='calendar' label='something' /> */}
      {/* </div> */}
      <div className='flex items-center hover:bg-neutral-800 rounded-lg cursor-pointer transition-all ease-in-out'>
        <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out' name={'calendar'} />
        <div className={`h-fit w-fit overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0'} transition-all duration-200 ease-in-out`}>Plan</div>
      </div>

      <div className='flex items-center hover:bg-neutral-800 rounded-lg cursor-pointer transition-all ease-in-out'>
        <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out' name={'chart-no-axes-column'} />
        <div className={`h-fit w-fit overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0'} transition-all duration-200 ease-in-out`}>Reports</div>
      </div>
      <div className='flex items-center hover:bg-neutral-800 rounded-lg cursor-pointer transition-all ease-in-out'>
        <LucideIcon className='hover:bg-neutral-800 rounded-lg transition-all ease-in-out' name={'landmark'} />
        <div className={`h-fit w-fit overflow-hidden whitespace-nowrap ${isOpen ? 'opacity-100' : 'opacity-0'} transition-all duration-200 ease-in-out`}>All Accounts</div>
      </div>

      {/* <SidebarButton icon='calendar' label='Plan' />
        <SidebarButton icon='chart-no-axes-column' label='Reports' />
        <SidebarButton icon='landmark' label='All accounts' /> */}


      <div className={`${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all duration-300 ease-in-out`}>
        <Dropdown />
        <Dropdown />
      </div>


    </div>
  )
}

export default Sidebar