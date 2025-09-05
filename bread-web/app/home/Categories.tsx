import React from 'react'
// import { LucideIcon } from '../components/LucideIcon'

const Topbar = () => {
  return (
    <div className='h-full w-full'>
      {/* calendar */}
      <div className='h-fit w-fit flex flex-col p-2.5 bg-neutral-900 rounded-lg border border-neutral-800'>
        <div className='w-full flex'>
          <div className='h-[20px] w-[20px]'></div>
          <p className="text-3xl">2025</p>
          <div className='h-[20px] w-[20px]'></div>
        </div>
        <div className='w-full flex'>
          <div className='h-[20px] w-[20px]'></div>
          <p className="text-3xl font-bold">JUN</p>
          <div className='h-[20px] w-[20px]'></div>
        </div>
      </div>
    </div>
  )
}

export default Topbar 