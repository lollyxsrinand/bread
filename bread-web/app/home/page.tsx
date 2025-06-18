import { isAuthenticated } from '@/utils/isAuthenticated'
import { JwtPayload } from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import React from 'react'
import Sidebar from '../components/Sidebar'

const Home = async () => {
    const jwtPayload = await isAuthenticated() as JwtPayload
    if (!jwtPayload) {
        redirect('/login')
    }
    const user_id = jwtPayload.uid
    console.log(user_id);
    return (
        <div className='h-screen w-full flex gap-2.5 justify-center items-center'>
            <Sidebar />
            <div className='h-screen w-full'></div>
        </div>
    )
}

export default Home