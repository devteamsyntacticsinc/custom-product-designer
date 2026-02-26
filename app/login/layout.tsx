import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Print Pro",
  description: "Sign in to your Print Pro account to manage your custom product designs",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
