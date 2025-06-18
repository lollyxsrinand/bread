"use client";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "firebase/auth";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

// auth functions prolly throw them somewhere else and arrange them and tidy this component?
const handleFirebaseAuth = async (AuthType: string, email: string, password: string) => {
    try {
        return AuthType === 'Login'
            ? await signInWithEmailAndPassword(auth, email, password)
            : await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.log(error);
        return null;
    }
}

const createUserBackend = async (uid: string) => {
    try {
        const response = await fetch("http://localhost:3001/signup", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${uid}`,
            },
        });
        return response.ok;
    } catch (error) {
        console.error("Error creating user in backend:", error);
        return false;
    }
}

const createSession = async (uid: string) => {
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ uid }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return res.ok 
    } catch (error) {
        console.error("ouchy ouchy creating session", error);
        return false;
    }
}

// TODO: add loading state, error handling, and form validation
export const AuthForm = ({ AuthType }: { AuthType: "Login" | "Signup" }) => {
    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;


        // sign in or sign up user with firebase functions
        const userCredential = await handleFirebaseAuth(AuthType, email, password)

        if (!userCredential) {
            console.log('something wrong');
            return
        }

        // if user is signing up, create a user in the backend
        if (AuthType === "Signup")
            await createUserBackend(userCredential.user.uid)


        const sessionCreated = await createSession(userCredential.user.uid)
        // true if session is created else false

        if (sessionCreated) {
            router.push("/home");
        }
    }

    // TODO: make styling responsive & use variables
    // or probably good enough for most screens :D
    return (
        <>
            <div className="h-screen w-full flex items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="h-[320px] w-[240px] p-[10px] flex flex-col items-center justify-center gap-[10px] text-center"
                >
                    <h1 className="text-[24px] font-bold p-[5px] w-full">{AuthType}</h1>
                    <div className="flex flex-col gap-[10px] items-center jusitfy-center w-full">
                        <input
                            className="p-[10px] bg-[#e5e5ea] focus: border-none rounded-[4px] w-full"
                            placeholder="email"
                            type="email"
                            name="email"
                        />
                        <input
                            className="p-[10px] bg-[#e5e5ea] rounded-[4px] w-full"
                            placeholder="password"
                            type="password"
                            name="password"
                        />
                    </div>
                    <button type="submit" className="bg-[#242628] w-full p-[10px] rounded-[4px] text-white">
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
