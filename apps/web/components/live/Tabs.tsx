"use client"
import { Award, ChartNoAxesColumn, MessagesSquare } from 'lucide-react'
import React, { ReactNode, useState } from 'react'
import { motion } from 'motion/react'
import { Interaction } from '@/types/types'

const liveTabs: {
    name: string;
    icon: React.ReactNode;
    code: Interaction;
}[] = [
    {
        name: "Q&A",
        icon: <MessagesSquare size={17} className='mt-1' />,
        code: "qna"
    },
    {
        name: "Polls",
        icon: <ChartNoAxesColumn size={17} className='mt-1' />,
        code: 'poll'
    },
    {
        name: "Quiz",
        icon: <Award size={17} className='mt-1' />,
        code: "quiz"
    }
]

const Tabs = ({interaction, setInteraction}: {interaction: Interaction, setInteraction: (val: Interaction) => void}) => {

    return (
        <div className='flex py-1 gap-2 border-b border-input'> 
            {liveTabs.map((tab, idx) => (
                <div key={idx} className='relative'>
                    <div 
                        onClick={() => {
                            setInteraction(tab.code)
                        }} 
                        className={`flex gap-1 items-center px-3 py-1 rounded-lg cursor-pointer duration-100 transition-colors`}>
                        {tab.icon}
                        <span className='text-lg text-foreground/80 font-semibold'>{tab.name}</span>
                    </div>
                    {interaction === tab.code && (
                        <motion.div 
                            layoutId="underline"
                            className="absolute -bottom-1 left-0 h-[2px] w-full bg-secondary-foreground"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default Tabs