import React from 'react'
import { MenuItemTab } from './AdminQuestionBox'
import { Trash2, Trophy } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import PollCard from '../cards/PollCard'

const AdminQuizBox = () => {
    return (
        <div>
            <div className='flex justify-between items-center p-2'>
                <MenuItemTab icon={<Trophy size={17} className='mt-1' />} label='Quiz' />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className='hover:bg-neutral-800 p-2 rounded-full'>
                            <Trash2 size={17} className='hover:text-red-400 cursor-pointer' />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        Clear quiz
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    )
}

export default AdminQuizBox