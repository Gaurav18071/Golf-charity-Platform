import AuthCard from "@/src/components/auth/AuthCard";
import LoginForm from "@/src/components/auth/LoginForm";
import { AUTH_TEXT } from "@/src/constants/auth";

export default function LoginPage() {
  return (
    <AuthCard
      title={AUTH_TEXT.loginTitle}
      subtitle={AUTH_TEXT.loginSubtitle}
    >
      <LoginForm />
    </AuthCard>
  );
}