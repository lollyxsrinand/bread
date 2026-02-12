import { getUser } from '@/lib/actions/user.actions'
import { getcookielikewtfbro } from '@/utils/get-user'
import React from 'react'

const Home = async () => {
  const token = await getcookielikewtfbro()
  const user = await getUser(token)

  console.log(user)
  return (
    <div>Home</div>
  )
}

export default Home