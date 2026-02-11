import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export const getUser = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return null
    
    const decoded = verify(token, process.env.JWT_SECRET as string) as { uid: string, email: string }

    return { uid: decoded.uid, email: decoded.email}
}