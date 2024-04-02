import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cookies } from "next/headers";

export default async function HeaderComponent() {
  async function signOut() {
    "use server";
    await cookies().delete("access_token");
  }
  return (
    <div className="flex w-full py-6 px-8 justify-between items-center">
      <Link href="/">
        <Gamepad2 className="w-10 h-10 text-purple-800" />
      </Link>
      <form action={signOut}>
        <Button type="submit">Sign Out</Button>
      </form>
    </div>
  );
}
