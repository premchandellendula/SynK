import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ChartNoAxesColumn, ChevronDown, ChevronUp, EllipsisVertical } from 'lucide-react'
import usePollStore from '@/store/pollStore'
import { AnimatePresence, motion } from 'motion/react'
import axios from 'axios'
import useRoomStore from '@/store/roomStore'

const Polls = () => {
    const { polls, setPolls } = usePollStore();
    const [isChevronDown, setIsChevronDown] = useState(false);
    const roomId = useRoomStore((state) => state.room?.roomId)

    useEffect(() => {
        const fetchPolls = async () => {
            const response = await axios.get(`/api/room/${roomId}/polls`, {
                withCredentials: true
            })

            const polls = response.data.polls;

            setPolls(polls)
        }
        fetchPolls()
    }, [])

    return (
        <>    
            {polls.length > 0 && (
                <div className='my-2'>
                    <span className='text-sm flex'>Polls</span>
                    <div className='flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] p-2 border border-secondary rounded-sm'>
                        <div className='flex justify-between items-center px-2'>
                            <span>{polls.length} Poll{polls.length !== 1 ? "s" : ""}</span>
                            <button className='bg-input/30 hover:bg-input/50 p-2 rounded-full cursor-pointer' onClick={() => setIsChevronDown(!isChevronDown)}>
                                {isChevronDown ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18}  />
                                )}
                            </button>
                        </div>
                        <AnimatePresence>
                            {isChevronDown && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className='overflow-hidden flex flex-col gap-2'
                                >
                                    {polls.map((poll, idx) => (
                                        <motion.div 
                                        key={poll.id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        layout // ← this is the key!
                                        className='flex justify-between items-center border border-input/70 hover:border hover:border-input p-2 rounded-sm'>
                                            <span>{poll.pollQuestion}</span>
                                            <Button
                                                size={"icon"}
                                                className='rounded-full bg-transparent hover:bg-secondary/80'
                                                >
                                                <EllipsisVertical size={15} className='text-foreground' />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </>
    )
}

export default Polls