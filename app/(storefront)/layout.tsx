import { Toaster } from "@/components/ui/sonner";
import { StorefrontNav } from "@/components/storefront/Navbar";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StorefrontNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Kens.lk</p>
          <p>Official bookshop of Leeds International School — 13 branches island-wide.</p>
          <p className="mt-2">© {new Date().getFullYear()} Kens.lk. All rights reserved.</p>
        </div>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
