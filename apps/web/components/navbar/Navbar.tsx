import React from 'react'
import Logo from '../ui/Logo'
import ThemeButton from '../theme/ThemeButton'

const Navbar = () => {
    return (
        <nav className='w-full flex justify-between items-center border-b border-sidebar-border px-6'>
            <div className='flex items-center'>
                <Logo size={16} />
                <h2 className='text-3xl font-semibold text-primary mb-1'>Synk</h2>
            </div>
            <div className='flex gap-2'>
                <ThemeButton />
                <div className='h-9 w-9 bg-neutral-500 rounded-full'></div>
            </div>
        </nav>
    )
}

export default Navbar