import React from 'react'
import { MenuItemTab } from './AdminQuestionBox'
import { ChartNoAxesColumn, Trash2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import PollCard from '../cards/PollCard'

const AdminPollsBox = () => {
    return (
        <div>
            <div className='flex justify-between items-center h-10'>
                <MenuItemTab icon={<ChartNoAxesColumn size={18} className='mt-1 text-blue-500' />} label='Polls' />
                <Tooltip>
                    <div className='p-2 rounded-full'>
                        <TooltipTrigger asChild>
                                <Trash2 size={17} className='hover:text-red-400 cursor-pointer' />
                        </TooltipTrigger>
                    </div>
                    <TooltipContent>
                        Clear all polls
                    </TooltipContent>
                </Tooltip>
            </div>
            <PollCard />
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center">
                Section 2 Footer
            </div>
        </div>
    )
}

export default AdminPollsBox