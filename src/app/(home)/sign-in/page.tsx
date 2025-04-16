import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-sm text-gray-600 mt-2">Welcome back to Hacka-Builder</p>
      </div>
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
            footerActionLink: "text-indigo-600 hover:text-indigo-500"
          }
        }}
        path="/sign-in"
        signUpUrl="/sign-up"
        redirectUrl="/hackathons"
      />
    </main>
  );
} 