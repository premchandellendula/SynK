"use client"
import React, { useState } from 'react'
import ThemeButton from '../theme/ThemeButton'
import { useUser } from '@/hooks/useUser'
import Flyout from './Flyout'

const UserNavbar = ({name}: {name: string | undefined}) => {
    const { user } = useUser();
    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
    
    return (
        <nav className='w-full fixed bg-background z-10 flex justify-between items-center border-b border-sidebar-border px-6 py-2'>
            <div className='text-xl'>{name}</div>
            <ThemeButton />
            <div className='relative'>
                <div 
                    onClick={() => {
                        setIsFlyoutOpen(!isFlyoutOpen)
                    }}
                    className='h-9 w-9 bg-input flex justify-center items-center rounded-full cursor-pointer'
                    >
                        {user?.name[0]?.toUpperCase() || "U"}
                </div>
            </div>
            {isFlyoutOpen && <Flyout setIsFlyoutOpen={setIsFlyoutOpen} />}
        </nav>
    )
}

export default UserNavbar