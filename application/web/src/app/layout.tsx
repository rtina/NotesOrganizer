import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Notes Organizer",
  description: "Personal notes + file attachments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}