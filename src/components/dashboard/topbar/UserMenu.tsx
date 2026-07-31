"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { getCurrentUser, signOut } from "@/src/lib/auth";

export function UserMenu() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        const email = user.email || "";
        
        setUserName(name);
        setUserEmail(email);

        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
          setUserInitials(`${parts[0][0]}${parts[1][0]}`.toUpperCase());
        } else if (parts.length === 1 && parts[0].length > 0) {
          setUserInitials(parts[0].slice(0, 2).toUpperCase());
        } else {
          setUserInitials("U");
        }
      }
    }

    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-11 items-center px-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        aria-label="Open user menu"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-emerald-700 text-white font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Desktop Only */}
        <div className="ml-2 hidden text-left lg:block">
          <p className="text-sm font-medium leading-none text-slate-900">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
            {userEmail || "Account"}
          </p>
        </div>

        <ChevronDown className="ml-2 hidden h-4 w-4 text-muted-foreground lg:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <span className="font-semibold text-slate-900 truncate">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {userEmail}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="cursor-pointer"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}