import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 h-12 w-12 rounded-lg bg-orange" />
          <h1 className="text-2xl font-bold">Production Book</h1>
          <p className="mt-1 text-sm text-white/70">Program belajar event management Enter Event House</p>
        </div>
        <LoginForm next={next || "/"} />
      </div>
    </main>
  );
}
