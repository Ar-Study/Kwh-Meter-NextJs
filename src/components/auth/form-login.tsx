"use client";

import { signInCredentials } from "@/lib/actions";
import React, { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FormLogin = () => {
  const [state, formAction] = useFormState(signInCredentials, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Berhasil Sign In");

      setTimeout(async () => {
        await router.push("/");
        await router.refresh();
      }, 1500);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">AHC Manufacture</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="user@example.com"
            />
            {state?.error?.email && (
              <p className="text-sm text-red-500 mt-1">{state.error.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="******"
            />
            {state?.error?.password && (
              <p className="text-sm text-red-500 mt-1">
                {state.error.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p className="font-medium">Admin: admin@example.com / admin123</p>
          <p className="font-medium">User: user@example.com / user123</p>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;
