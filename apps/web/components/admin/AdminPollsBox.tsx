import React from 'react'
import { MenuItemTab } from './AdminQuestionBox'
import { ChartNoAxesColumn } from 'lucide-react'
import PollCard from '../cards/PollCard'

const AdminPollsBox = () => {
    return (
        <div>
            <div className='flex justify-between items-center h-10'>
                <MenuItemTab icon={<ChartNoAxesColumn size={18} className='mt-1 text-blue-500' />} label='Polls' />
            </div>
            <PollCard />
        </div>
    )
}

export default AdminPollsBox