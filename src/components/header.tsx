'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { FilePlus2, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [logoUrl, setLogoUrl] = useState("https://picsum.photos/seed/logo/40/40");
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const storedLogo = localStorage.getItem('company-logo');
    if (storedLogo) {
      setLogoUrl(storedLogo);
    }
    
    const handleStorageChange = () => {
        const storedLogo = localStorage.getItem('company-logo');
        if (storedLogo) {
            setLogoUrl(storedLogo);
        }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }

  }, []);

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-card border-b sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-accent">
            <Image src={logoUrl} alt="Company Logo" width={40} height={40} className="rounded-md object-cover" data-ai-hint="logo" />
            PawBalance
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild>
                <Link href="/invoices/new">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create New Invoice
                </Link>
            </Button>
            {isAuthenticated && (
                <Button variant="outline" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
