import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SignupForm from "./SignupForm";
export default function AuthCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Golf Charity Platform
          </h1>

          <p className="text-sm text-muted-foreground">
            Create your account to get started.
          </p>
        </CardHeader>
         <CardContent>
            <SignupForm />
          </CardContent>
       
      </Card>
    </div>
  );
}