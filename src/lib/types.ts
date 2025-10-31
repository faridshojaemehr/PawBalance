export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Client {
  name: string;
  email: string;
  address: Address;
}

export interface Sender {
  name: string;
  email: string;
  address: Address;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'draft';

export interface Invoice {
  id: string; // Auto-generated invoice number
  sender: Sender;
  client: Client;
  items: InvoiceItem[];
  invoiceDate: string; // ISO string
  dueDate: string; // ISO string
  status: InvoiceStatus;
  notes?: string;
  taxRate?: number;
}
