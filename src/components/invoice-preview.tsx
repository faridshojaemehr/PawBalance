import type { Invoice } from "@/lib/types";
import { format } from "date-fns";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

type InvoicePreviewProps = {
  invoice: Invoice;
};

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = subtotal * ((invoice.taxRate || 0) / 100);
  const total = subtotal + tax;

  const AddressDisplay = ({
    address,
  }: {
    address: { street: string; city: string; state: string; zip: string };
  }) => (
    <>
      <p>{address.street}</p>
      <p>
        {address.city}, {address.state} {address.zip}
      </p>
    </>
  );

  return (
    <Card className="w-[210mm] min-h-[297mm] mx-auto p-8 shadow-lg bg-white text-black relative">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <Image
            src={invoice.logoUrl || "https://picsum.photos/seed/logo/60/60"}
            alt="Company Logo"
            width={60}
            height={60}
            className="rounded-md object-cover"
            data-ai-hint="logo"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {invoice.sender.name}
            </h1>
            <div className="text-gray-600">
              <AddressDisplay address={invoice.sender.address} />
              <p>{invoice.sender.email}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold uppercase text-gray-400">
            Invoice
          </h2>
          <p className="text-gray-600 mt-2"># {invoice.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Bill To
          </h3>
          <div className="mt-2 text-gray-800">
            <p className="font-bold">{invoice.client.name}</p>
            <AddressDisplay address={invoice.client.address} />
            <p>{invoice.client.email}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="grid grid-cols-2 text-sm">
            <span className="font-semibold text-gray-500">Invoice Date:</span>
            <span className="text-gray-800">
              {format(new Date(invoice.invoiceDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="grid grid-cols-2 text-sm mt-1">
            <span className="font-semibold text-gray-500">Due Date:</span>
            <span className="text-gray-800">
              {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="grid grid-cols-2 text-sm mt-1">
            <span className="font-semibold text-gray-500">Status:</span>
            <span className="font-bold text-gray-800 uppercase">
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      <table className="w-full text-left table-auto">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-600 uppercase">
            <th className="p-3 font-semibold">Description</th>
            <th className="p-3 font-semibold text-center">Qty</th>
            <th className="p-3 font-semibold text-right">Unit Price</th>
            <th className="p-3 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-100">
              <td className="p-3">{item.description}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-right">{formatCurrency(item.price)}</td>
              <td className="p-3 text-right">
                {formatCurrency(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-start mt-8">
        <div className="w-1/2">
          {invoice.paymentDetails &&
            (invoice.paymentDetails.bankName ||
              invoice.paymentDetails.accountName ||
              invoice.paymentDetails.iban) && (
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase">
                  Payment Details
                </h4>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {invoice.paymentDetails.bankName && (
                    <p>
                      <strong>Bank:</strong> {invoice.paymentDetails.bankName}
                    </p>
                  )}
                  {invoice.paymentDetails.accountName && (
                    <p>
                      <strong>Account Name:</strong>{" "}
                      {invoice.paymentDetails.accountName}
                    </p>
                  )}
                  {invoice.paymentDetails.iban && (
                    <p>
                      <strong>IBAN:</strong> {invoice.paymentDetails.iban}
                    </p>
                  )}
                </div>
              </div>
            )}
          {invoice.notes && (
            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">
                Notes
              </h4>
              <p className="text-sm text-gray-600 mt-2">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-800">{formatCurrency(subtotal)}</span>
          </div>
          {invoice.taxRate && invoice.taxRate > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tax ({invoice.taxRate || 0}%)
              </span>
              <span className="text-gray-800">{formatCurrency(tax)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-800">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 left-8 right-8 text-center text-xs text-gray-400">
        <p>Thank you for your business!</p>
        <p>© 2025 PawSolutions Oy. All rights reserved.</p>

        {/* <p>{invoice.sender.name} - {invoice.sender.email}</p> */}
      </footer>
    </Card>
  );
}
