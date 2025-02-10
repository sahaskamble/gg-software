'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="w-full h-screen bg-slate-950 text-white flex flex-col gap-4 justify-center items-center overflow-hidden">
      <div className='flex flex-col items-center p-4'>
        <Image src="/light-logo.png" alt="Logo" width={200} height={200} />
      </div>
      <Link
        href={'/login'}
      className='px-4 py-2 bg-blue-500 text-white rounded active:bg-blue-600 text-base lg:text-xl font-semibold'
      >Go to Login</Link>
    </main>
  );
}
