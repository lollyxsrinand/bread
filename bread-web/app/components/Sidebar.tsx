import React from 'react'
import { Icon } from './Icon'

const Sidebar = () => {
  return (
    <div className="h-full bg-black text-white w-1/5">
      <div className="w-full h-fit flex gap-2 p-2">
        <Icon name="bread" />
        <h1 className="text-lg font-semibold">Srinand's Budget 2025</h1>
      </div>
      <div className="flex flex-col w-full">
        <button type="button" className="sidebar-button bg-gray-400">
          <Icon name="calendar" />
          <h1 className="text-sm font-medium">Budget</h1>
        </button>
        <div className="sidebar-button">
          <Icon name="bars" />
          <h1 className="text-sm font">Reports</h1>
        </div>
        <div className="sidebar-button">
          <Icon name="bank" />
          <h1 className="text-sm font">All accounts</h1>
        </div>
      </div>
    </div>
  )
}

export default Sidebar