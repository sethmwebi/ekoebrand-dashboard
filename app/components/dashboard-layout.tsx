import { NavLink, Outlet, useNavigate } from "react-router";
import type { Route } from "../+types/root";
import { Button } from "~/components/ui/button";
import {
  GaugeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ShoppingBasket,
  TicketsIcon,
  TruckIcon,
  UsersIcon,
  UsersRoundIcon,
} from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Navbar from "./navbar";
import { useAuthStore } from "~/store/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ekoebrand Dashboard" },
    {
      name: "description",
      content: "Welcome to Ekoebrand Dashboard application!",
    },
  ];
}

const navLinks = [
  {
    name: "Categories",
    url: "/categories",
    icon: <LayoutDashboardIcon size={16} />,
  },
  {
    name: "Coupons",
    url: "/coupons",
    icon: <TicketsIcon size={16} />,
  },
  {
    name: "Customers",
    url: "/customers",
    icon: <UsersRoundIcon size={16} />,
  },
  {
    name: "Orders",
    url: "/orders",
    icon: <TruckIcon size={16} />,
  },
  {
    name: "Products",
    url: "/products",
    icon: <ShoppingBasket size={16} />,
  },
  {
    name: "Staff",
    url: "/staff",
    icon: <UsersIcon size={16} />,
  },
];

export default function DashboardLayout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call your backend logout endpoint
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Clear client-side auth state
      clearAuth();

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="mt-[44px] flex bg-accent">
        <nav className="w-10 md:w-56 relative flex justify-between flex-col bg-background no-scrollbar min-h-[calc(100vh-44px)] overflow-y-auto">
          <ul className="ml-2 max-w-full mr-2 flex gap-6 mt-4 flex-col">
            <NavLink to={"/"} className="w-full flex items-center gap-x-2">
              <GaugeIcon size={16} className="font-bold h-4 w-4" />
              <span className="hidden md:block">Dashboard</span>
            </NavLink>
            {navLinks.map((navLink, i) => (
              <NavLink
                key={`${navLink.name}-${i}`}
                to={navLink.url}
                className={"flex gap-x-2 items-center"}
              >
                <span>{navLink.icon}</span>
                <span className="hidden md:block">{navLink.name}</span>
              </NavLink>
            ))}
          </ul>

          <div className="sticky flex items-center justify-center bottom-0 left-0 w-full mb-1 bg-background">
            <Button
              onClick={handleLogout}
              className="md:w-[98%] flex items-center bg-background hover:bg-background-none gap-2 cursor-pointer rounded-sm text-white md:bg-brand-orange md:hover:bg-brand-orange-dark dark:md:bg-brand-orange-dark dark:md:hover:bg-brand-orange"
            >
              <span className="ring-1 md:ring-0 text-primary rounded-full flex justify-center items-center p-1 h-7 w-7">
                <LogOutIcon size={16} className="md:text-white" />
              </span>
              <span className="hidden md:block">Logout</span>
            </Button>
          </div>
        </nav>
        <ScrollArea className="w-full overflow-y-auto h-[calc(100vh-44px)]">
          <Outlet />
        </ScrollArea>
      </div>
    </>
  );
}
