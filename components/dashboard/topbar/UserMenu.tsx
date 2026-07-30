"use client";

import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          className="h-11 px-2 hover:bg-accent"
          aria-label="Open user menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>

          {/* Desktop Only */}
          <div className="ml-2 hidden text-left lg:block">
            <p className="text-sm font-medium leading-none">
              Gaurav
            </p>

            <p className="text-xs text-muted-foreground">
              Admin
            </p>
          </div>

          <ChevronDown className="ml-2 hidden h-4 w-4 text-muted-foreground lg:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold">
              Gaurav
            </span>

            <span className="text-xs text-muted-foreground">
              gaurav@example.com
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}