'use server'
import { cookies } from "next/headers"

export const getcookielikewtfbro = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    
    return token ?? '' // this line is crying
}