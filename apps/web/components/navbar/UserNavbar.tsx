"use client"
import React from 'react'
import ThemeButton from '../theme/ThemeButton'
import { useUser } from '@/hooks/useUser'

const UserNavbar = ({name}: {name: string | undefined}) => {
    const { user } = useUser();
    return (
        <nav className='w-full fixed bg-background z-10 flex justify-between items-center border-b border-sidebar-border px-6 py-2'>
            <div className='text-xl'>{name}</div>
            <ThemeButton />
            <div className='h-9 w-9 bg-input flex justify-center items-center rounded-full'>{user?.name[0]?.toUpperCase() || "U"}</div>
        </nav>
    )
}

export default UserNavbar