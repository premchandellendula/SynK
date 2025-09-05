"use client"
import React, { useState } from 'react'
import Logo from '../ui/Logo'
import ThemeButton from '../theme/ThemeButton'
import { useUser } from '@/hooks/useUser';
import { useSession } from 'next-auth/react';
import Flyout from './Flyout';

const Navbar = () => {
    const { user } = useUser();
    const { data: session } = useSession();
    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
    
    return (
        <nav className='w-full flex-shrink-0 bg-background flex justify-between items-center border-b border-sidebar-border px-6'>
            <div className='flex items-center'>
                <Logo size={16} />
                <h2 className='text-3xl font-semibold text-primary mb-1'>Synk</h2>
            </div>
            <div className='flex gap-2'>
                <ThemeButton />
                <div
                    onClick={() => {
                        setIsFlyoutOpen(!isFlyoutOpen)
                    }}
                    className='h-9 w-9 bg-input flex justify-center items-center rounded-full cursor-pointer'
                >
                    {(user?.name?.[0]?.toUpperCase()) || (session?.user?.name?.[0]?.toUpperCase()) || "U"}
                </div>
            </div>

            {isFlyoutOpen && <Flyout setIsFlyoutOpen={setIsFlyoutOpen} />}
        </nav>
    )
}

export default Navbar