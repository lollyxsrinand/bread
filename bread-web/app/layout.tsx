import type { Metadata } from "next";

import "./globals.css";
import { ToastContainer } from "react-toastify";


export const metadata: Metadata = {
  title: "Bread",
  description: "Not your average bread.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        {/* <div className="h-4 w-4 bg-white rounded-lg fixed top-4 right-4"></div> */}
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
