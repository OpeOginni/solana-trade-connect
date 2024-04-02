"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinksType = {
  name: string;
  pathName: string;
  href: string;
};

const navLinks: NavLinksType[] = [
  {
    name: "Dashboard",
    pathName: "/dashboard",
    href: "/dashboard",
  },
  {
    name: "Chats",
    pathName: "/chats",
    href: "/chats",
  },
];
export function HeaderNav() {
  const pathName = usePathname();

  return (
    <div className="hidden md:flex md:gap-x-12">
      {navLinks.map((navLink) => (
        <Link
          key={navLink.name}
          href={navLink.href}
          className={cn(
            "text-sm font-semibold leading-6 py-1 px-2 rounded-md",
            pathName == navLink.href ? "text-amber-600" : "text-gray-900  hover:bg-gray-200"
          )}
        >
          {navLink.name}
        </Link>
      ))}
    </div>
  );
}

export function HeaderNavMobile() {
  const pathName = usePathname();

  return (
    <div className="space-y-2 py-6">
      {navLinks.map((navLink) => (
        <Link
          key={navLink.name}
          href={navLink.href}
          className={cn(
            "-mx-3 block rounded-md px-3 py-2 text-base font-semibold leading-7 ",
            pathName == navLink.href ? "text-amber-600" : "text-gray-900  hover:bg-gray-50"
          )}
        >
          {navLink.name}
        </Link>
      ))}
    </div>
  );
}
