import { getcookielikewtfbro } from "@/utils/get-user"

export const getUser = async () => {
    const token = await getcookielikewtfbro()
    const res = await fetch(`http://localhost:3001/me`, {
        headers: { 
            'Authorization': `Bearer ${token}`
         },
    })

    if (!res.ok) return null

    const { user } = await res.json()

    return user
}