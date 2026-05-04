import { Suspense } from "react";
import LoginForm from "./LoginForm";

function LoginFallback() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[440px] rounded-[1.35rem] border border-primary/[0.08] bg-surface-lowest/90 p-10 animate-pulse">
        <div className="h-8 bg-surface-low rounded-lg mx-auto w-40 mb-4" />
        <div className="h-4 bg-surface-low rounded w-2/3 mx-auto mb-8" />
        <div className="space-y-4">
          <div className="h-11 bg-surface-low rounded-lg" />
          <div className="h-11 bg-surface-low rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
