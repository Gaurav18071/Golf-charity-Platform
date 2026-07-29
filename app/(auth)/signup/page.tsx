import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";
import { AUTH_TEXT } from "@/constants/auth";

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