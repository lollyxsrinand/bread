"use client";
import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, } from "firebase/auth";
import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// auth functions prolly put them somewhere else and arrange them and tidy this component?
const handleFirebaseAuth = async (AuthType: string, email: string, password: string) => {
    try {
        return AuthType === 'Login'
            ? await signInWithEmailAndPassword(auth, email, password)
            : await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        toast((error as any).message, { type: "error" })
        // console.log(error);
        return null;
    }
}

const createUserBackend = async (uid: string) => {
    try {
        const response = await fetch("http://localhost:3001/new-user", {
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
            // toast("what wrong idk", { type: "error" })
            console.log('something wrong');
            return
        }

        // if user is signing up, create a user in the backend
        if (AuthType === "Signup")
            await createUserBackend(userCredential.user.uid)

        // const start = performance.now()
        const sessionCreated = await createSession(userCredential.user.uid) // true if session is created else false
        // const end = performance.now()
        // console.log(`Session created in ${end - start}ms`); // log the time taken to create session

        if (sessionCreated) {
            window.location.href = '/home'
            // router.push("/home");
        }
    }

    // TODO: make styling responsive & use variables
    // or probably good enough for most screens :D
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
                    <div className="flex flex-col gap-[10px] items-center jusitfy-center w-full">
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
