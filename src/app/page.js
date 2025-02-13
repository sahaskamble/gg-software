'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex gap-4 flex-col justify-center items-center">
      <div className="py-2">
        <Image src={'/light-logo.png'} width={200} height={80} alt="logo" />
      </div>
      <Button
        onClick={() => { router.push('/login') }}
        className="active:bg-secondary/10">
        Go to Login
      </Button>
    </div>
  );
}
