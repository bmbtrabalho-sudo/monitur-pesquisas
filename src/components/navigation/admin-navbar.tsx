"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SingOutButton from "./signOut-button";
import Image from "next/image";

const navItems = [
  { title: "Home", href: "/dashboard" },
  { title: "Pesquisas", href: "/pesquisas" },
  { title: "Modelos", href: "/templates" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitialName =
    session?.user?.name?.split(" ")[0].charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-blue-500/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex-1">
          <Link
            href="/dashboard"
            className="flex items-center text-xl gap-2 ml-2 font-semibold text-white"
          >
            <Image
              src={"/governo-do-estado-ro.svg"}
              alt="Governo do Estado de Rondônia"
              width={120}
              height={80}
            />
            SETUR Pesquisas
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="h-10 rounded-md px-4 py-2 flex justify-center items-center text-white font-medium hover:bg-blue-600 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 justify-end items-center gap-4 mr-2">
          {/* Menu do Usuário (Desktop) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="bg-white h-10 w-10 cursor-pointer">
                  <AvatarFallback className="text-xl font-bold text-blue-600">
                    {getInitialName}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-zinc-50"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <Link
                      href="/perfil"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Meu perfil
                    </Link>
                    {session?.user?.role === "ADMIN" && (
                      <p className="text-xs leading-none text-muted-foreground">
                        <Link
                          href="/usuarios"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Gerenciar usuários
                        </Link>
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SingOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão Sanduíche e Menu Mobile (só aparece em telas pequenas) */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-600 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Menu Mobile Dropdown (sem alteração) */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-in fade-in-20 slide-in-from-top-2">
          <nav className="grid grid-cols-2 place-items-center gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center text-white rounded-md p-2 text-sm font-medium hover:bg-blue-600 w-full justify-center"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="border-t pt-2 p-4">
            <Link
              href="/perfil"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-2 flex justify-center rounded-md p-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              Meu perfil
            </Link>
            <SingOutButton />
          </div>
        </div>
      )}
    </header>
  );
}
