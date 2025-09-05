import { isAuthenticated } from '@/utils/isAuthenticated'
import { JwtPayload } from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import React from 'react'
import Sidebar from '../components/Sidebar'
// import { Category } from 'bread-core/src'
// import Categories from './Categories'
import Topbar from './Categories'

const Home = async () => {
    const jwtPayload = await isAuthenticated() as JwtPayload
    if (!jwtPayload) {
        redirect('/login')
    }
    const user_id = jwtPayload.uid
    console.log(user_id);

    return (
        <div className="h-screen w-full flex">
            <Sidebar />
            <div className="h-screen w-full flex flex-col p-2.5"> 
                <Topbar />
                <div className='h-full w-full'>

                </div>
            </div>
        </div>
    )
}

export default Home