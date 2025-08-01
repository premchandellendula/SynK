import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { ChartNoAxesColumn, ChevronDown, ChevronUp, EllipsisVertical, X } from 'lucide-react'
import usePollStore from '@/store/pollStore'
import { AnimatePresence, motion } from 'motion/react'
import axios from 'axios'
import useRoomStore from '@/store/roomStore'
import { useUser } from '@/hooks/useUser'
import { useSocket } from '@/hooks/useSocket'
import { Interaction, Poll } from '@/types/types'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'

const Polls = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const { polls, setPolls, setActivePoll, removePoll } = usePollStore();
    const [isChevronDown, setIsChevronDown] = useState(false);
    const roomId = useRoomStore((state) => state.room?.roomId);
    const [openPollId, setOpenPollId] = useState<string | null>(null);
    const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('down');
    const pollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const { user } = useUser();
    const socket = useSocket();
    useJoinRoomSocket({ socket, roomId, userId: user?.id })

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

    useEffect(() => {
        if (!socket) return;
        const handlePollDeleted = (data: {poll: Poll}) => {
            const { poll } = data;
            removePoll(poll.id);
        }
        const attachListener = () => {
            socket.on("poll-removed", handlePollDeleted)
        }

        if (socket.connected) {
            attachListener();
        }
        socket.on("connect", attachListener)

        return () => {
            socket.off("poll-removed", handlePollDeleted);
            socket.off("connect", attachListener);
        };
    }, [socket])

    useEffect(() => {
            if (!socket) return;
    
            const handleLaunchExistingPoll = (data: { poll: Poll}) => {
                console.log("🚀 Received existing-poll-launched:", data);
                const { poll } = data;
                setActivePoll(poll);
                setInteraction("poll")
            };
    
            const attachListener = () => {
                socket.on("existing-poll-launched", handleLaunchExistingPoll);
            };
    
            if (socket.connected) {
                attachListener();
            }
    
            socket.on("connect", attachListener);
    
            return () => {
                socket.off("existing-poll-launched", handleLaunchExistingPoll);
                socket.off("connect", attachListener);
            };
        }, [socket]);

    const handleRelaunchPoll = (pollId: string) => {
        try {
            // console.log("Socket connected:", socket.connected);
            if (!socket.connected) {
                socket.connect();
                socket.once('connect', () => {
                    socket.emit('launch-existing-poll', {
                        pollId,
                        roomId,
                        userId: user?.id
                    });
                    setInteraction('poll');
                });
            } else {
                socket.emit('launch-existing-poll', {
                    pollId,
                    roomId,
                    userId: user?.id
                });
                setInteraction('poll');
            }
        } catch(err) {
            console.error('Failed to relaunch a poll:', err);
        }
    }

    const handleDeletePoll = (pollId: string) => {
        try{
            socket.emit("remove-poll", {
                pollId,
                roomId,
                userId: user?.id
            })
        }catch(err){
            console.error("Failed to delete the poll: ", err)
        }
    }

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
                                        <div 
                                            key={poll.id || idx} 
                                            className="relative" 
                                            ref={(el) => {
                                                pollRefs.current[poll.id] = el;
                                            }}
                                        >
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                layout
                                                className='flex justify-between items-center border border-input/70 hover:border hover:border-input p-2 rounded-sm'
                                            >
                                                <span>{poll.pollQuestion}</span>
                                                <Button
                                                    size={"icon"}
                                                    className='rounded-full bg-transparent hover:bg-secondary/80'
                                                    onClick={() => {
                                                        const el = pollRefs.current[poll.id];
                                                        if (el) {
                                                            const rect = el.getBoundingClientRect();
                                                            const windowHeight = window.innerHeight;
                                                            if (windowHeight - rect.bottom < 150) {
                                                                setMenuDirection('up');
                                                            } else {
                                                                setMenuDirection('down');
                                                            }
                                                        }
                                                        setOpenPollId(openPollId === poll.id ? null : poll.id);
                                                    }}
                                                    >
                                                    <EllipsisVertical size={15} className='text-foreground' />
                                                </Button>
                                            </motion.div>
                                            {openPollId === poll.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`
                                                        absolute right-12 
                                                        ${menuDirection === 'up' ? 'bottom-2 mb-2' : 'top-2 mt-2'}
                                                        w-48 bg-popover shadow-md rounded border border-border z-60
                                                    `}
                                                >
                                                    <div className="flex flex-col text-sm">
                                                        <button className="hover:bg-muted px-4 py-2 text-left cursor-pointer" onClick={() => handleRelaunchPoll(poll.id)}>
                                                            Launch Poll
                                                        </button>
                                                        <button className="hover:bg-muted px-4 py-2 text-left cursor-pointer" onClick={() => handleDeletePoll(poll.id)}>
                                                            Delete Poll
                                                        </button>
                                                        {/* <button className="hover:bg-muted px-4 py-2 text-left" onClick={handleRelaunchPoll}>
                                                            View Results
                                                        </button> */}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
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