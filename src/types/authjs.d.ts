import { DefaultSession } from "next-auth";


declare module "next-auth" {
    interface Session {
        user: User & DefaultSession["user"];

    }

    interface User{
        role: string;
    }   
}

declare module "next-auth/jwt" {
    interface JWT{
        sub:string
        role:string
    }
}