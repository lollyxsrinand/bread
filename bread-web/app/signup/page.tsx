import React from 'react'
import { AuthForm } from '../components/AuthForm'

const Signup = () => {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <AuthForm AuthType='signup'/>
    </div>
  )
}

export default Signup