import React, { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import axios from 'axios'
import useRoomStore from '@/store/roomStore'
import usePollStore from '@/store/pollStore'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'
import { useUser } from '@/hooks/useUser'
import Spinner from '../loaders/Spinner'
import { Poll } from '@/types/types'
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket'

const PollCard = () => {
    const [pollQuestion, setPollQuestion] = useState("")
    const [options, setOptions] = useState(['', ''])
    const [loadingForAdd, setLoadingForAdd] = useState(false);
    const [loadingForLaunch, setLoadingForLaunch] = useState(false);
    const { activePoll, addPoll, setActivePoll, polls } = usePollStore();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const socket = useSocket();
    const { user } = useUser();

    useJoinRoomSocket({ socket, roomId, userId: user?.id })

    const handleAddOption = () => {
        if (options.length < 4) {
            setOptions(prev => [...prev, ''])
        }
    }

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(prev => prev.filter((_, i) => i !== index))
        }
    }

    const handleInputChange = (index: number, value: string) => {
        setOptions(prev => {
            const newOptions = [...prev]
            newOptions[index] = value
            return newOptions
        })
    }

    const clearPoll = () => {
        setPollQuestion('');
        setOptions(['', '']);
    };

    useEffect(() => {
        if (!socket) return;

        const handleLaunchNewPoll = (data: { poll: Poll}) => {
            console.log("🚀 Received new-poll-launched:", data);
            const { poll } = data;
            addPoll(poll);
            setActivePoll(poll);
        };

        const attachListener = () => {
            console.log("✅ Socket connected. Attaching listener.");
            socket.on("new-poll-launched", handleLaunchNewPoll);
        };

        if (socket.connected) {
            attachListener();
        }

        socket.on("connect", attachListener);

        return () => {
            console.log("❌ Cleaning up listeners.");
            socket.off("new-poll-launched", handleLaunchNewPoll);
            socket.off("connect", attachListener);
        };
    }, [socket]);

    const handleAddNewPoll = async () => {
        if (!pollQuestion.trim() || options.some(opt => !opt.trim())) {
            toast.warning("Please fill all the fields before adding the poll");
            return;
        }
        setLoadingForAdd(true);

        try {
            const response = await axios.post(`/api/room/${roomId}/polls`, {
                pollQuestion: pollQuestion,
                options: options.map(opt => ({ text: opt }))
            }, {withCredentials: true})

            const poll = response.data.poll;
            addPoll(poll);
            clearPoll();
            setPollQuestion("")
        } catch(err) {
            console.error('Failed to add a new poll:', err);
            setLoadingForAdd(false);
        }finally{
            setLoadingForAdd(false)
        }
    }

    const handleLaunchNewPoll = () => {
        setLoadingForLaunch(true)

        try {
            if (!pollQuestion.trim() || options.some(opt => !opt.trim())) {
                toast.warning("Please fill all the fields")
                return;
            }
            socket.emit("launch-new-poll", {
                pollQuestion,
                options: options.map(opt => ({ text: opt })) ,
                roomId,
                userId: user?.id
            });

            clearPoll();
        } catch(err) {
            console.error('Failed to add and launch a new poll:', err);
            setLoadingForLaunch(false);
        }finally{
            setLoadingForLaunch(false)
        }
    }
    return (
        <div>
            {activePoll ? (
                <ActivePollCard />
            ) : (
                <>
                    <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
                        <div className='flex justify-end'>
                            <Tooltip>
                                <div className='p-2 rounded-full'>
                                    <TooltipTrigger asChild>
                                            <Trash2 size={17} className='hover:text-red-400 cursor-pointer' onClick={clearPoll} />
                                    </TooltipTrigger>
                                </div>
                                <TooltipContent>
                                    Clear poll
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input placeholder='What would you like to ask?' value={pollQuestion} className='py-8 text-3xl' onChange={(e) => setPollQuestion(e.target.value)}/>
                        {options.map((option, i) => (
                            <div
                                key={i}
                                className='flex gap-2 items-center'
                            >
                                <Input
                                    value={option}
                                    onChange={e => handleInputChange(i, e.target.value)}
                                    placeholder={`Option ${i + 1}`}
                                    className='py-3 text-2xl flex-1'
                                />
                                <Button 
                                    variant='ghost'
                                    onClick={() => handleRemoveOption(i)}
                                    disabled={options.length <= 2}
                                    className='bg-input/50 p-2 rounded-sm'
                                >
                                    <Minus size={16} className='mt-0.5' />
                                </Button>
                            </div>
                        ))}

                        <div className='flex gap-2 mt-4'>
                            <Button
                                onClick={handleAddOption}
                                disabled={options.length >= 4}
                                variant={"ghost"}
                                className='px-4 py-2 rounded-sm disabled:opacity-50'
                            >
                                <Plus size={16} />
                                Add Option
                            </Button>
                        </div>

                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center px-4 gap-2">
                        <Button variant={"default"} onClick={handleLaunchNewPoll} disabled={loadingForLaunch} className='w-24'>
                            {loadingForLaunch ? (
                                <Spinner />
                            ) : (
                                "Launch Poll"
                            )}
                        </Button>
                        <Button variant={"ghost"} onClick={handleAddNewPoll} disabled={loadingForAdd} className='w-24'>
                            {loadingForAdd ? (
                                <Spinner />
                            ) : (
                                "Add Poll"
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

function ActivePollCard(){
    const { activePoll } = usePollStore();
    if(!activePoll) return;
    // console.log(activePoll.options);
    if(!activePoll.options) return;

    const totalVotes = activePoll.options.reduce(
        (acc, opt) => acc + (opt.voteCount || 0),
        0
    );

    return (
        <>
            <div className='p-2 flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] border border-input rounded-sm'>
                <p className='text-2xl font-semibold text-foreground/90 border border-input rounded-sm p-4 h-22 flex items-center'>
                    {activePoll.pollQuestion || 'What would you like to ask?'}
                </p>
                {activePoll.options.map((option, i) => {
                    const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0

                    return (
                        <div key={i} className='flex flex-col gap-1.5 w-full border border-input p-4 rounded-sm'>
                            <div className='flex justify-between text-sm text-foreground/80'>
                                <span className='text-base truncate max-w-[70%]' title={option.text}>{option.text}</span>
                                <span>{Math.round(percentage)}%</span>
                            </div>
                            <div className='relative w-full h-3 bg-secondary rounded-sm overflow-hidden'>
                                <div
                                    className='absolute top-0 left-0 h-full bg-primary rounded-sm transition-all duration-300'
                                    style={{ width: `${percentage}%` }}
                                    role="progressbar"
                                    aria-valuenow={percentage}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className='flex gap-2 mt-4'>
                <Button
                    variant={"default"}
                    className='px-4 py-2 rounded-sm disabled:opacity-50'
                >
                    End Poll
                </Button>
            </div>
        </>
    )
}

export default PollCard