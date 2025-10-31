"use client";

import { useParams, useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/use-invoices";
import InvoicePreview from "@/components/invoice-preview";
import { Button } from "@/components/ui/button";
import { Edit, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import type { Invoice } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoiceById, isLoading } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (id && !isLoading) {
      const foundInvoice = getInvoiceById(id);
      setInvoice(foundInvoice);
    }
  }, [id, getInvoiceById, isLoading]);

  const handlePrint = async () => {
    const invoiceElement = document.getElementById("invoice-preview-container");

    if (!invoiceElement) {
      console.error("Invoice preview container not found.");
      return;
    }

    const html2pdf = (await import('html2pdf.js')).default;

    const options: any = {
      margin: 10,
      filename: `Invoice-${invoice?.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 4, useCORS: true }, // Use scale 4 for better quality, as in original
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Handle page breaks
    };

    try {
      await html2pdf().set(options).from(invoiceElement).save();
      console.log("PDF generated successfully.");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Remove print-specific styles
      // document.body.classList.remove("print-active");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-8">
        <Skeleton className="h-16 w-full max-w-[800px]" />
        <Skeleton className="h-[842px] w-[595px]" />
      </div>
    );
  }

  if (!invoice && !isLoading) {
    return <div className="text-center py-20">Invoice not found.</div>;
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-8">
        <Skeleton className="h-16 w-full max-w-[800px]" />
        <Skeleton className="h-[842px] w-[595px]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="no-print w-full max-w-[800px] mx-auto flex justify-end gap-2 mb-8">
        <Button
          variant="outline"
          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        {/* <Button onClick={handleDownloadExcel}>
                <FileDown className="mr-2 h-4 w-4" /> Download as Excel
            </Button> */}
        <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90">
          <Printer className="mr-2 h-4 w-4" /> Save as PDF
        </Button>
      </div>
      <div id="invoice-preview-container" className="flex justify-center">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
