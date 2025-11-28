import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Triangle } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-20 table-scroll">
      <div className="w-full absolute top-0 left-0 flex p-6">
        <Link href="/" className="flex items-center justify-center w-12 h-12">
          <Image
            src="/logo.png"
            alt="My Outfit"
            width={100}
            height={100}
            className="w-full h-full dark:invert"
          />
        </Link>
      </div>
      <div className="w-full max-w-sm p-4 space-y-4">
        <RegisterForm />
      </div>
    </div>
  );
}
