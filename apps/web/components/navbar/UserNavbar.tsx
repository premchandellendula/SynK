import React from 'react'
import ThemeButton from '../theme/ThemeButton'

const UserNavbar = ({name}: {name: string | undefined}) => {
    
    return (
        <nav className='w-full flex justify-between items-center border-b border-sidebar-border px-6 py-2'>
            <div className='text-xl'>{name}</div>
            <ThemeButton />
            <div className='h-9 w-9 bg-neutral-500 rounded-full'></div>
        </nav>
    )
}

export default UserNavbar