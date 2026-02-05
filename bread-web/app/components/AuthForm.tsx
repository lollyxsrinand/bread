'use client'
import { auth } from "@/lib/firebase/client"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent } from "react"
import { toast } from "react-toastify"

// TODO: MAGIC LINK AUTH SHIT
export const AuthForm = ({ AuthType }: { AuthType: 'login' | 'signup' }) => {
  const router = useRouter()
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const userCredential = AuthType === 'login'
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);

      const idToken = await userCredential.user.getIdToken();
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${AuthType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });

      if(res.ok) {
        router.push("/home");
        toast.success(`${AuthType} successful!`);
      }
    } catch (error) {
      toast.error(((error as FirebaseError).code).replace('auth/', '').replaceAll('-', ' '));
      console.log('error: ', error);
    }

  }
  return (
    <form onSubmit={handleSubmit}
      className='h-48 w-3xs p-2.5 flex flex-col gap-4'>
      <h1 className='text-center'>{AuthType}</h1>
      <div className="flex flex-col gap-2.5">
        <input
          className='bg-neutral-950 p-2 rounded-lg focus:outline-none border border-neutral-800'
          type="email"
          placeholder='email'
          name='email'
        />
        <input
          className='bg-neutral-950 p-2 rounded-lg focus:outline-none border border-neutral-800'
          type="password"
          placeholder='password'
          name='password'
        />
        <button className="w-full hover:bg-neutral-100 hover:text-black transition-colors p-2 rounded-lg focus:outline-none">{AuthType}</button>
        <p>or {
          AuthType == "login"
            ? <Link className="font-bold" href="/signup">signup</Link>
            : <Link className="font-bold" href="/login">login</Link>
        }
        </p>
      </div>
    </form>
  )
}
