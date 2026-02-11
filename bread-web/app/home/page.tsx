import { getUser } from "@/utils/get-user"
import { cookies } from "next/headers"

const home = async () => {
  const user = await getUser()
  if(!user) return null

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  const res = await fetch('http://localhost:3001/budgets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })

  const budgets = await res.json()
  console.log(budgets);

  return (
    <div>
      {budgets.map((budget: any) => (
        <h1 key={budget.id}>{budget.name}</h1>
      ) )}
    </div>
  )
}

export default home