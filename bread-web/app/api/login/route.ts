import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { idToken } = await request.json()
    
    const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    })

    if (!res.ok) {
        const errorData = await res.json()
        console.error("login failed: ", errorData)
        return NextResponse.json({ message: "login failed" }, { status: 401 })
    }

    const { jwtToken } = await res.json() 
    console.log(jwtToken);

    const cookieStore = await cookies()
    cookieStore.set("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

    return NextResponse.json({ message: "login successful" }, { status: 200 })
}