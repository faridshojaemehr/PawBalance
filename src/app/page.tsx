'use client';

import InvoiceDashboard from '@/components/invoice-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    // You can render a loading spinner here
    return (
        <div className="flex justify-center items-center h-full">
            <p>Loading...</p>
        </div>
    );
  }

  return <InvoiceDashboard />;
}
