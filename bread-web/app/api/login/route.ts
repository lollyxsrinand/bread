import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { uid } = await req.json();
  const token = jwt.sign({ uid }, process.env.NEXT_PUBLIC_JWT_SECRET ?? "", {
    expiresIn: "14d",
  });

  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return new Response("ok");
}
