import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    handle?: string;
  }

  interface Session {
    user: User & {
      id: string;
      handle?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
  }
}
