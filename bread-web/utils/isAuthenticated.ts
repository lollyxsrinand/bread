import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const isAuthenticated = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    return jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET ?? "");
  } catch (error) {
    console.log(error);
    return null;
  }
};
