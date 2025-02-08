'use client';

import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();

  function handleRoute() {
    router.push('/login')
  }

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 justify-center items-center">
      <div className="text-3xl">Game Ground Where Victory Meets Vibes</div>
      <button
        onClick={handleRoute}
        className="px-4 py-2 bg-blue-500 active:bg-blue-600 rounded-md shadow-gray-800 shadow-md text-lg font-bold"
      >
        login
      </button>
    </div>
  );
}
