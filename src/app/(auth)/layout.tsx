export const runtime = "edge";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Simple layout for auth/public pages (no sidebar/navbar)
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
