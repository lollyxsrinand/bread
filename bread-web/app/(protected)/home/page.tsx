import { getUser } from '@/lib/actions/user.actions'
import { getcookielikewtfbro } from '@/utils/get-user'
import React from 'react'

// rename "Home" to "Plan"
const Home = async () => {
  const token = await getcookielikewtfbro()
  const user = await getUser(token)

  console.log(user)
  return (
    <div className=''>Home</div>
  )
}

export default Home