import { copyToClipboard } from '@/lib/utils'
import { Copy, MoveLeft } from 'lucide-react'
import React from 'react'
import Dates from '../utils/Dates'

interface IHostNavbar {
    name: string,
    startDate: string,
    endDate: string,
    code: string
}

const HostNavbar = ({name, startDate, endDate, code}: IHostNavbar) => {
    return (
        <nav className='fixed top-0 left-0 right-0 h-15 w-full flex justify-between items-center border-b border-sidebar-border px-6 py-2'>
            <div className='flex items-center gap-3'>
                <span className='bg-secondary border border-background hover:border-muted/20 p-2.5 rounded-full mt-1 cursor-pointer'>
                    <MoveLeft size={16} />
                </span>
                <span className='text-xl'>{name}</span>
            </div>
            <div className='flex items-center gap-4'>
                <Dates startDate={startDate} endDate={endDate} />
                <div onClick={() => copyToClipboard(code || "")} className='flex items-center gap-1 hover:bg-secondary/20 hover:text-violet-500 px-2 py-1 rounded-sm cursor-pointer'>
                    <Copy size={14} />
                    <span className='text-sm'>{code}</span>
                </div>
            </div>
        </nav>
    )
}

export default HostNavbar