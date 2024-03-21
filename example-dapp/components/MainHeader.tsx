import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { CrossIcon, MenuIcon, XIcon } from "lucide-react";
import ConnectWalletButton from "./ConnectWallet";
import { HeaderNav, HeaderNavMobile } from "./HeaderNavigation";
import Image from "next/image";

export default function MainHeader() {
  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <Image className="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="" width={0} height={0} />
          </a>
        </div>
        <div className="flex lg:hidden">
          <Sheet defaultOpen={false}>
            <SheetTrigger>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent>
              <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div className="flex items-center justify-between">
                  <a href="#" className="-m-1.5 p-1.5">
                    <span className="sr-only">Your Company</span>
                    <Image
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt=""
                      width={0}
                      height={0}
                    />
                  </a>
                  <SheetClose>
                    <XIcon />
                  </SheetClose>
                </div>
                <MobileNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <HeaderNav />
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <ConnectWalletButton />
        </div>
      </nav>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="mt-6 flow-root">
      <div className="-my-6 divide-y divide-gray-500/10">
        <div className="space-y-2 py-6">
          <HeaderNavMobile />
        </div>
        <div className="py-6">
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  );
}
