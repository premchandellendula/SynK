"use client"
import { ChartLine, ChartNoAxesColumn, ChevronLeft, ChevronRight, Menu, Plus, Radio, Trophy, X } from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import QnA from '../cards/QnA'
import Polls from '../cards/Polls'
import Quizzes from '../cards/Quizzes'
import { Interaction } from '@/types/types'
import PollImg from '../svgIcons/PollImg'
import QuizImg from '../svgIcons/QuizImg'
import ThemeButton from '../theme/ThemeButton'
import { cn } from '@/lib/utils'

const sidebarItems = [
    {
        icon: <Radio size={19} />,
        label: "Interactions"
    },
    {
        icon: <ChartLine size={19} />,
        label: "Analytics"
    }
]

const actItems: {
    img: React.ReactNode;
    icon: React.ReactNode;
    label: string;
    code: Interaction;
}[] = [
    {
        img: <PollImg />,
        icon: <ChartNoAxesColumn size={18} className='text-blue-600' />,
        label: "Poll",
        code: 'poll'
    },
    {
        img: <QuizImg />,
        icon: <Trophy size={18} className='text-red-400' />,
        label: "Quiz",
        code: 'quiz'
    }
]

interface IInteractionBox {
    setInteraction: (val: Interaction) => void;
}

const InteractionBox = ({setInteraction}: IInteractionBox) => {
    const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState<boolean>(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-16 left-2 z-50 md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {!isSidebarOpen &&  <Menu className="h-6 w-6" />}
            </Button>
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
            <aside
                className={cn(
                "fixed left-0 top-0 z-40 h-full lg:w-full w-64 border-r border-sidebar-border transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0 bg-sidebar" : "-translate-x-full",
                )}
            >
                <div className='flex flex-col h-full overflow-hidden'>
                    <div className='h-10 flex justify-between items-center'>
                        <span className='text-lg font-medium'>My Interactions</span>
                        <Button 
                            variant={"ghost"}
                            onClick={() => {
                                setIsSidebarOpen(!isSidebarOpen)
                            }}
                            className={`${isSidebarOpen ? "block" : "hidden"}`}
                        >
                            {isSidebarOpen && <ChevronLeft size={18} />} 
                        </Button>
                        {/* ChevronsRight, should put when sidebar is closed */}
                    </div>
                    <div className='absolute top-10 bottom-12 left-0 right-0 overflow-y-auto p-2'>
                        <Button
                            onClick={() => {
                                setIsInteractionDialogOpen(true)
                                document.body.style.overflow = 'hidden'
                            }}
                            className='my-2'
                        >
                            <Plus />
                            <span>Add</span>
                        </Button>
                        <QnA onClick={() => setInteraction("qna")} />
                        <Polls setInteraction={setInteraction} />
                        <Quizzes />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 flex justify-between items-center">
                        {sidebarItems.map((item, idx) => <SidebarItem key={idx} icon={item.icon} label={item.label} />)}
                        <div className='p-2 rounded-full flex justify-center items-center cursor-pointer'>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ThemeButton />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Theme
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {isInteractionDialogOpen && (
                        <div className="fixed inset-0 min-h-screen w-full flex justify-center items-center z-50 bg-black/80">
                            <div className="bg-white dark:bg-neutral-900 w-fit flex flex-col rounded-md p-8">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold">New Interaction</span>
                                    <X size={17} className='cursor-pointer' onClick={() => { 
                                            setIsInteractionDialogOpen(!isInteractionDialogOpen)
                                            document.body.style.overflow = 'unset'
                                        }} />
                                </div>
                                <div className='grid grid-cols-2 gap-3 mt-2'>
                                    {actItems.map((item, idx) => <InteractionCard key={idx} img={item.img} icon={item.icon} label={item.label} code={item.code} setInteraction={setInteraction} setIsInteractionDialogOpen={setIsInteractionDialogOpen} />)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}

function InteractionCard({
    img,
    icon,
    label,
    code,
    setInteraction,
    setIsInteractionDialogOpen
}: {
    img: ReactNode,
    icon: ReactNode,
    label: string,
    code: Interaction,
    setInteraction: (val: Interaction) => void,
    setIsInteractionDialogOpen: (val: boolean) => void
}) {
    return (
        <div
        onClick={() => {
            setInteraction(code)
            setIsInteractionDialogOpen(false)
        }}
        className='flex flex-col shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-muted-foreground/20 rounded-sm cursor-pointer hover:border-muted'>
            <div className='bg-muted rounded-t-sm'>
                {img}
            </div>
            <div className='flex items-center justify-center gap-2 p-2'>
                <span>{icon}</span>
                <span className='text-xl'>{label}</span>
            </div>
        </div>
    )
}

function SidebarItem({icon, label}: {icon: ReactNode, label: string}){
    return (
        <div className='p-2 rounded-full flex justify-center items-center cursor-pointer hover:bg-accent'>
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

export default InteractionBox