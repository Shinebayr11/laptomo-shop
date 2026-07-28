import { AuthForm } from "@/components/auth/AuthForm";
export const metadata = { title: "Нэвтрэх" };

type LoginPageProps = {
  searchParams?: {
    next?: string;
    reset?: string;
    confirmed?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const notice =
    searchParams?.reset === "1"
      ? "Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү."
      : searchParams?.confirmed === "1"
        ? "Имэйл амжилттай баталгаажлаа. Одоо нэвтэрнэ үү."
        : "";

  return (
    <div className="page-enter">
      <AuthForm
        mode="login"
        nextPath={searchParams?.next}
        initialNotice={notice}
      />
    </div>
  );
}
