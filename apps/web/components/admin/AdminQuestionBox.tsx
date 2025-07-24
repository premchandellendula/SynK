import { Archive, ArchiveX, MessageSquareMore } from 'lucide-react'
import React, { ReactNode } from 'react'

const menuItems = [
    {
        icon: <Archive size={18} className='mt-1' />,
        label: "Archive"
    },
    {
        icon: <ArchiveX size={18} className='mt-1' />,
        label: "Ignored"
    }
]

const AdminQuestionBox = () => {
    return (
        <div className='flex justify-between items-center h-10'>
            <MenuItemTab icon={<MessageSquareMore size={20} className='mt-1 text-green-500' />} label='Audience Q&A' />
            <div className='flex items-center gap-4'>
                {menuItems.map((item, idx) => <MenuItemTab key={idx} icon={item.icon} label={item.label} />)}
            </div>
        </div>
    )
}

export function MenuItemTab({icon, label}: {icon: ReactNode, label: string}){
    return (
        <div className='flex items-center gap-1'>
            {icon}
            <span className='font-normal text-foreground text-lg'>{label}</span>
        </div>
    )
}

export default AdminQuestionBox