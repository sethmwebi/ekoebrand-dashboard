import { BellIcon, CircleUserRoundIcon } from "lucide-react";
import { Link } from "react-router";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between border-b-[1px] z-10 h-[44px] fixed right-0 left-0 top-0 bg-background px-2 backdrop-blur-lg border-neutral-100 dark:border-neutral-900">
      <div className="flex items-center gap-2">
        <Link to="/" className="bg-accent rounded-full">
          <img src="/logo.png" alt="logo" className="h-8 w-8 object-contain" />
        </Link>
        <span className="">Ekoebrand</span>
      </div>
      <div className="flex gap-3 items-center">
        <ThemeToggle />
        <div className="relative">
          <BellIcon className="h-4 w-4 cursor-pointer" />
          <span className="bg-brand-orange dark:bg-brand-orange-dark text-white absolute -top-2 cursor-pointer -right-1 text-xs h-2 w-2 p-1.5 flex items-center justify-center rounded-full">
            3
          </span>
        </div>
        <CircleUserRoundIcon className="h-4 w-4 cursor-pointer" />
      </div>
    </div>
  );
}
