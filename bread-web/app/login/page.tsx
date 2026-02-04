import { AuthForm } from '../components/AuthForm'

const Login = () => {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <AuthForm AuthType='login'/>
    </div>
  )
}

export default Login 