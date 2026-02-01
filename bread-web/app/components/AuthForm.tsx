import React from 'react'

export const AuthForm = ({ AuthType }: { AuthType: 'login' | 'signup' }) => {
  return (
    <div>{AuthType}</div>
  )
}
