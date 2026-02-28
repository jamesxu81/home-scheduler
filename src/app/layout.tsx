import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Scheduler",
  description: "Manage family events and kids activities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
