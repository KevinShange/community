import "next-auth";
import type { LoginType } from "@/types/models";

declare module "next-auth" {
  interface User {
    id?: string;
    handle?: string;
    loginType?: LoginType;
  }

  interface Session {
    user: User & {
      id: string;
      handle?: string;
      loginType?: LoginType;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
    loginType?: LoginType;
  }
}
