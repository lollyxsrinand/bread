"use client";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// TODO: add loading state, error handling, and form validation
export const AuthForm = ({ AuthType }: { AuthType: "Login" | "Signup" }) => {
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userCredential = AuthType === 'Login'
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      console.log(idToken);

      const res = await fetch(`http://localhost:3001/${AuthType.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });

      if ((await res.json()).status === "success") {
        router.push("/home");
        toast.success(`${AuthType} successful!`);
      }
    } catch (error) {
      // toast.error(((error as FirebaseError).code).replace('auth/', '').replaceAll('-', ' '));
      console.log('error: ', error);
    }
  }
  
  // TODO: make styling responsive & use variables
  // or nvm just probably good enough for most screens :D
  return (
    <>
      <div className="h-screen w-full flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="h-[320px] w-[240px] p-[10px] justify-center flex flex-col gap-[10px]"
        >
          <div className="flex justify-center">
            <h3 className="font-bold text-center">{AuthType.toLowerCase()}</h3>
          </div>
          <div className="flex flex-col gap-[10px] items-center justify-center w-full">
            <input
              className="form-input"
              placeholder="email"
              type="email"
              name="email"
            />
            <input
              className="form-input"
              placeholder="password"
              type="password"
              name="password"
            />
          </div>
          {/* bg-[#242628] w-full p-[10px] rounded-[4px] text-white cursor-pointer */}
          <button type="submit" className="button bg-white text-black hover:invert-10 w-full">
            {AuthType}
          </button>
          <p> or {" "}
            <a className="font-bold" href={AuthType === "Login" ? "/signup" : "/login"}>
              {AuthType === "Login" ? "signup" : "login"}
            </a>
          </p>
        </form>
      </div>
    </>
  );
};
