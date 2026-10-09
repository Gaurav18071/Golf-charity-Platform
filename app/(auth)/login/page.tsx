"use client";

import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { AUTH_TEXT } from "@/constants/auth";

export default function LoginPage() {
  const [demoEmail, setDemoEmail] = useState<string>();
  const [demoPassword, setDemoPassword] = useState<string>();

  const handleSelectAccount = (email: string, password: string) => {
    setDemoEmail(email);
    setDemoPassword(password);
  };

  return (
    <AuthCard
      title={AUTH_TEXT.loginTitle}
      subtitle={AUTH_TEXT.loginSubtitle}
    >
      <DemoBanner onSelectAccount={handleSelectAccount} />
      <LoginForm demoEmail={demoEmail} demoPassword={demoPassword} />
    </AuthCard>
  );
}