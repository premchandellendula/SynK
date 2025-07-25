import { Check, ThumbsUp, X } from 'lucide-react'
import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { AnimatePresence, easeIn, easeOut, motion } from 'motion/react';

const icons = [
    {
        icon: <Check size={16} />,
        tooltip: "Mark as answered"
    },
    {
        icon: <X size={16} />,
        tooltip: "Ignore"
    }
]
const QuestionOnAdminPanel = () => {
    const [isHovered, setIsHovered] = useState(false);
    const divVariant = {
        open: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.25, ease: easeOut }
        },
        closed: {
            opacity: 0.5,
            y: -4,
            transition: { duration: 0.2, ease: easeIn }
        }
    }
    return (
        <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className='relative w-full shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] px-4 py-3 bg-background border-y border-background hover:border-y hover:border-input'>
            <div className='mb-2 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 bg-neutral-200 rounded-full flex justify-center items-center'>U</div>
                    <span className='text-[15px]'>Anonymous</span>
                    <span className='text-[14px] text-neutral-500'>3 hours ago</span>
                </div>
                <div className='flex items-center gap-2 h-8 rounded-full cursor-pointer'>
                    <span>2</span>
                    <ThumbsUp size={14} className='text-neutral-700' />
                </div>
            </div>
            <span>how about giving remote job?</span>

            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                    key="actions"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={divVariant}
                    transition={{ duration: 0.1 }}
                    className='absolute right-14 top-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-full flex gap-1.5 px-3 py-1'>
                        {icons.map((icon, idx) => (
                            <div key={idx} className='hover:bg-neutral-200/40 px-2 py-2 rounded-full flex justify-center items-center cursor-pointer'>
                                <Tooltip>
                                    <TooltipTrigger>
                                        {icon.icon}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {icon.tooltip}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default QuestionOnAdminPanel