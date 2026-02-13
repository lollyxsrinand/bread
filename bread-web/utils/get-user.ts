'use server'
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export const getcookielikewtfbro = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    // crying
    return token ?? ''
}

export const getUserId = async () => {
    const token = await getcookielikewtfbro ()

    if (!token) return null

    const decoded = verify(token, process.env.JWT_SECRET as string) as { uid: string }

    return { uid: decoded.uid }
}