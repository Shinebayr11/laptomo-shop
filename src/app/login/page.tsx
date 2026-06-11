import { AuthForm } from "@/components/auth/AuthForm";
export const metadata = { title: "Нэвтрэх" };
export default function LoginPage() {
  return <div className="page-enter"><AuthForm mode="login" /></div>;
}
