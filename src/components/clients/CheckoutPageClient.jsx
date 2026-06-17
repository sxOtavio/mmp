// src/components/clients/CheckoutPageClient.jsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { CartDrawer } from "@/components/user/CartDrawer";
import Link from 'next/link';
import CheckoutPanel from '../checkout/CheckoutPanel';
import Header from '../checkout/CheckoutHeader';

export default function CheckoutPageClient() {

  return (

    <div>
       <Header/>
       <CartDrawer />
       <CheckoutPanel/>
    </div>
    
  );
}