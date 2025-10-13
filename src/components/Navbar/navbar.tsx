"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/Auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        setIsAuth(false);
        setUserRole(null);
        setUsername(null);
        window.location.href = "/"; // Redirect to home page
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  interface NavItem {
    name: string;
    href: string;
  }

  const [navItems, setNavItems] = useState<NavItem[]>([
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" }
  ]);

  // ✅ Check auth state and get user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/Auth/profile");
        if (res.ok) {
          const data = await res.json();
          setIsAuth(true);
          setUserRole(data.user?.role || null);
          setUsername(data.user?.username || null);

          // Update navigation items based on user role
          const baseItems = [
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
            { name: "Services", href: "/services" },
            { name: "Contact", href: "/contact" }
          ];

          setNavItems(baseItems);
        } else {
          setIsAuth(false);
          setUserRole(null);
          setUsername(null);
        }
      } catch {
        setIsAuth(false);
        setUserRole(null);
        setUsername(null);
      }
    };
    checkAuth();
  }, []);

  return (
    <header className="bg-emerald-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-8 py-3">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-wide hover:scale-105 transition-transform">
          Vet🐾Care
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          {isAuth && (
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} className="px-4 py-2 hover:bg-emerald-600 rounded-md transition">
                      {item.name}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* ✅ Auth Buttons */}
          <div className="ml-6 flex gap-2 items-center">
            {!isAuth && (
              <Link href="/Auth/signup">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500">Sign Up</Button>
              </Link>
            )}
            {isAuth && userRole === "admin" && (
              <Link href="/admin">
                <Button className="bg-white text-emerald-700 hover:bg-gray-200">
                  Admin Dashboard
                </Button>
              </Link>
            )}
            {isAuth && userRole === "vet" && (
              <Link href="/veterinarian/dashboard">
                <Button className="bg-white text-emerald-700 hover:bg-gray-200">
                  Vet Dashboard
                </Button>
              </Link>
            )}
            {isAuth && userRole === "petOwner" && username && (
              <span className="text-white font-medium px-3 py-2">
                Welcome, {username}
              </span>
            )}
            {!isAuth && (
              <Link href="/Auth/login">
                <Button className="bg-white text-emerald-700 hover:bg-gray-200">
                  Login
                </Button>
              </Link>
            )}
            {isAuth && (
              <Button
                onClick={handleLogout}
                className="bg-black text-white cursor-pointer hover:bg-gray-600"
              >
                Logout
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-emerald-700 text-white">
              <div className="flex flex-col gap-4 mt-6">
                {isAuth && navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg hover:bg-emerald-600 px-4 py-2 rounded-md transition"
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* ✅ Mobile Auth Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                  {!isAuth && (
                    <Link
                      href="/Auth/signup"
                      className="text-lg bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition text-center"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  )}
                  {isAuth && userRole === "admin" && (
                    <Link
                      href="/admin"
                      className="text-lg bg-white text-emerald-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-center"
                      onClick={() => setOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {isAuth && userRole === "vet" && (
                    <Link
                      href="/veterinarian/dashboard"
                      className="text-lg bg-white text-emerald-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-center"
                      onClick={() => setOpen(false)}
                    >
                      Vet Dashboard
                    </Link>
                  )}
                  {isAuth && userRole === "petOwner" && username && (
                    <div className="text-lg text-white font-medium px-4 py-2 text-center">
                      Welcome, {username}
                    </div>
                  )}
                  {!isAuth && (
                    <Link
                      href="/login"
                      className="text-lg bg-white text-emerald-700 px-4 py-2 rounded-md hover:bg-gray-200 transition text-center"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  {isAuth && (
                    <button
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                      className="text-lg bg-black text-white px-4 py-2 rounded-md hover:bg-gray-600 cursor-pointer transition text-center"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
