import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { AUTH_TEXT } from "@/constants/auth";

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