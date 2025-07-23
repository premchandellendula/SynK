"use client"
import { Award, ChartNoAxesColumn, MessagesSquare } from 'lucide-react'
import React, { ReactNode, useState } from 'react'
import { motion } from 'motion/react'

const liveTabs = [
    {
        name: "Q&A",
        icon: <MessagesSquare size={17} className='mt-1' />
    },
    {
        name: "Polls",
        icon: <ChartNoAxesColumn size={17} className='mt-1' />
    },
    {
        name: "Quiz",
        icon: <Award size={17} className='mt-1' />
    }
]

const Tabs = () => {
    const [selectedTab, setSelectedTab] = useState("Q&A")
    return (
        <div className='flex py-1 gap-2 border-b border-neutral-300'> 
            {liveTabs.map((tab, idx) => (
                <div key={idx} className='relative'>
                    <div 
                        onClick={() => setSelectedTab(tab.name)} 
                        className={`flex gap-1 items-center px-3 py-1 rounded-lg cursor-pointer duration-1000 transition-colors`}>
                        {tab.icon}
                        <span className='text-lg text-foreground/80 font-semibold'>{tab.name}</span>
                    </div>
                    {selectedTab === tab.name && (
                        <motion.div 
                            layoutId="underline"
                            className="absolute -bottom-1 left-0 h-[2px] w-full bg-neutral-700"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

export default Tabs