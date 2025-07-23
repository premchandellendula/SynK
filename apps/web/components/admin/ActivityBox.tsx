import { ChartLine, ChevronsLeft, Plus, Radio, Sun } from 'lucide-react'
import React, { ReactNode } from 'react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import QnA from '../cards/QnA'
import Polls from '../cards/Polls'
import Quizzes from '../cards/Quizzes'

const sidebarItems = [
    {
        icon: <Radio />,
        label: "Activites"
    },
    {
        icon: <ChartLine />,
        label: "Analytics"
    },
    {
        icon: <Sun />,
        label: "Theme"
    }
]

const ActivityBox = () => {
    return (
        <div className='flex flex-col h-full overflow-hidden'>
            <div className='h-[8%] flex justify-between items-center '>
                <span className='text-lg font-medium'>My Activities</span>
                <ChevronsLeft />
                {/* ChevronsRight, should put when sidebar is closed */}
            </div>
            <div className='h-[76%]'>
                <Button className='my-2'>
                    <Plus />
                    <span>Add</span>
                </Button>
                <QnA />
                <Polls />
                <Quizzes />
            </div>
            <div className=" h-[8%] flex justify-between items-center">
                {sidebarItems.map((item, idx) => <SidebarItem key={idx} icon={item.icon} label={item.label} />)}
            </div>
        </div>
    )
}

function SidebarItem({icon, label}: {icon: ReactNode, label: string}){
    return (
        <div className='p-2 rounded-full flex justify-center items-center cursor-pointer'>
            <Tooltip>
                <TooltipTrigger>
                    {icon}
                </TooltipTrigger>
                <TooltipContent>
                    {label}
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export default ActivityBox