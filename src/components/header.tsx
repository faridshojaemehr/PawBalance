import Link from 'next/link';
import { Button } from './ui/button';
import { FilePlus2 } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
            <Image src="https://picsum.photos/seed/logo/40/40" alt="Company Logo" width={40} height={40} className="rounded-md" data-ai-hint="logo" />
            InvoiceFlow
          </Link>
          <Button asChild>
            <Link href="/invoices/new">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create New Invoice
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
