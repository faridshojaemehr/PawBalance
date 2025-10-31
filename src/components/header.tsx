import Link from 'next/link';
import { Button } from './ui/button';
import { FilePlus2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-accent">
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
