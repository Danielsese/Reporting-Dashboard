"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, {});

  return (
    <main className="flex min-h-full items-center justify-center bg-bg p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-fg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Reports Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Daily, weekly &amp; monthly manager reports
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passcode">Access code</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    id="passcode"
                    name="passcode"
                    type="password"
                    autoComplete="off"
                    autoFocus
                    required
                    placeholder="Enter access code"
                    className="pl-9 text-center tracking-widest"
                  />
                </div>
              </div>
              {state?.error && (
                <p className="text-sm text-rag-red">{state.error}</p>
              )}
              <Button type="submit" disabled={pending} className="w-full">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                Unlock
              </Button>
              <p className="text-center text-xs text-muted">
                Enter the shared access code to open the dashboard.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
