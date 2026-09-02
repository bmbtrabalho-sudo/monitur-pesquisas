'use client';

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";

export default function SingOutButton(){
    return (
        <Button onClick={() => {
            signOut(redirect("/"));
        }}
        variant="outline"
        className="bg-red-500 text-white hover:bg-red-600 hover:text-white transition-colors"
        >
            Sair
        </Button>
    );
}