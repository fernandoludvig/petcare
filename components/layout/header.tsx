"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function Header() {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {user?.firstName ? `Olá, ${user.firstName}` : "Dashboard"}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}

