'use client'
import { auth, googleProvider } from "@/lib/firebase/client";
import { signInWithPopup } from "firebase/auth";

import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch(`http://localhost:3000/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idToken }),
      })

      if (res.ok) 
        router.push("/plan");
      else 
        console.error("Login failed: ", await res.json());

    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <button onClick={handleGoogleLogin} className="w-fit hover:bg-neutral-100 hover:text-black transition-colors px-4 py-2.5 rounded-lg focus:outline-none">
        login... or signup... same thing. with google :{`)`}
      </button>
    </div>
  );
};

export default Login;