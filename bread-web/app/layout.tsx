import type { Metadata } from "next";


import "./globals.css";
import { ToastContainer } from "react-toastify";


export const metadata: Metadata = {
  title: "bread",
  description: "not your average bread.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
