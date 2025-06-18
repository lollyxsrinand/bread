import { isAuthenticated } from '@/utils/isAuthenticated'
import { JwtPayload } from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import React from 'react'

const Home = async () => {
    const jwtPayload = await isAuthenticated() as JwtPayload
    if (!jwtPayload) {
        redirect('/login')
    }
    const user_id = jwtPayload.uid
    console.log(user_id);
    return (
        <div>Hi {user_id}</div>
    )
}

export default Home