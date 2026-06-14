import "@/app/globals.css";

export const metadata = { title: "Cue — Auto Demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: "100vh" }}>{children}</body>
    </html>
  );
}
