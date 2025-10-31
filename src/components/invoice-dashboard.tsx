'use client';

import { useInvoices } from '@/hooks/use-invoices';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { FilePlus2, Receipt } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function InvoiceDashboard() {
  const { invoices, isLoading } = useInvoices();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateTotal = (invoice: any) => {
    const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);
    const tax = subtotal * ((invoice.taxRate || 0) / 100);
    return subtotal + tax;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-20">
        <Receipt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/invoices/new">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.client.name}</TableCell>
                <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ${calculateTotal(invoice).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/invoices/${invoice.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
