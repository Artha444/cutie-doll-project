'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === '/dashboard' || pathname === '/admin-panel/dashboard';
  const isProduct = pathname.startsWith('/product/');
  const isHome = pathname === '/';
  const isAccount = pathname.startsWith('/account');
  const isCatalog = pathname === '/products';
  const isCart = pathname === '/cart';
  const isCheckout = pathname === '/checkout';

  return (
    <div className={`relative flex-1 flex flex-col ${isAdmin || isProduct || isHome || isAccount || isCatalog || isCart || isCheckout ? '' : 'pt-24'}`}>
      {children}
    </div>
  );
}
