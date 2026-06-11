import { AuthForm } from "@/components/auth/AuthForm";
export const metadata = { title: "Бүртгүүлэх" };
export default function RegisterPage() {
  return <div className="page-enter"><AuthForm mode="register" /></div>;
}
