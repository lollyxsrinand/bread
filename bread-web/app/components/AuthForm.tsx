import React from 'react'

export const AuthForm = ({ AuthType }: { AuthType: 'login' | 'signup' }) => {
  return (
    <div className='h-48 w-24 border'>
      <h1>{AuthType}</h1>
    </div>
  )
}
