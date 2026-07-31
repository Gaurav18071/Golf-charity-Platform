import AuthCard from "@/src/components/auth/AuthCard";
import SignupForm from "@/src/components/auth/SignupForm";
import { AUTH_TEXT } from "@/src/constants/auth";

export default function SignupPage() {
  return (
    <AuthCard
      title={AUTH_TEXT.signupTitle}
      subtitle={AUTH_TEXT.signupSubtitle}
    >
      <SignupForm />
    </AuthCard>
  );
}