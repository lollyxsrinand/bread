'use server'
import { getcookielikewtfbro } from "@/utils/get-user"
import { User } from "bread-core"

export const getUser = async () => {
    const token = await getcookielikewtfbro()

    const res = await fetch(`http://localhost:3001/me`, {
        headers: { 
            'Authorization': `Bearer ${token}`
         },
    })

    if (!res.ok) return null

    return await res.json() as User
}