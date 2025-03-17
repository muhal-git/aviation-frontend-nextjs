import LoginForm from "./login-form"

export default async function LoginPage() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
        <LoginForm />
      </div>
    </div>
  )
}