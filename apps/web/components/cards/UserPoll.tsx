import usePollStore from '@/store/pollStore'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { Interaction, Poll } from '@/types/types';
import { useSocket } from '@/hooks/useSocket';
import useRoomStore from '@/store/roomStore';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { useJoinRoomSocket } from '@/hooks/useJoinRoomSocket';

const UserPoll = ({setInteraction}: {setInteraction: (val: Interaction) => void}) => {
    const [selected, setSelected] = useState<string | null>(null)
    const { activePoll, setActivePoll } = usePollStore();
    // const [hasVoted, setHasVoted] = useState(false);
    // console.log(activePoll);
    const { user } = useUser();
    const roomId = useRoomStore((state) => state.room?.roomId)
    const socket = useSocket();
    useJoinRoomSocket({ socket, roomId, userId: user?.id })

    // const storeVoted = activePoll?.pollVotes?.some(vote => vote.userId === user?.id) || false;
    // console.log("storeVoted: ", storeVoted)
    // const alreadyVoted = hasVoted || storeVoted;
    // console.log("alreadyVoted: ", alreadyVoted);
    // console.log("hasVoted: ", hasVoted);
    
    useEffect(() => {
        setSelected(null);
        // setHasVoted(false);
    }, [activePoll?.id]);

    useEffect(() => {
        const handlePollEnded = ({poll}: {poll: Poll}) => {
            setActivePoll(null);
            setInteraction("qna")
        };
        socket.on("poll-ended", handlePollEnded)

        return () => {
            socket.off("poll-ended", handlePollEnded)
        }
    }, [socket, setActivePoll])

    const handlePollVote = async () => {
        try {
            if (!selected) {
                toast.warning("Please select an option")
                return;
            }
            socket.emit("vote-poll", {
                pollId: activePoll?.id,
                optionId: selected,
                roomId,
                userId: user?.id
            });

            // setHasVoted(true)
            setActivePoll(null);
            setSelected(null)
        } catch(err) {
            console.error('Failed to add vote:', err);
        }
    }

    if (!activePoll) {
        return (
            <div className='mt-20 text-center'>
                <h3 className='text-foreground text-lg'>No Active Poll</h3>
                <Button className='rounded-full mt-2' onClick={() => setInteraction("qna")}>
                    Move To Q&A
                </Button>
            </div>
        );
    }
    return (
        <div className='flex justify-center items-center mt-4'>
            <div className='w-full flex flex-col items-center justify-center'>
                <div className='p-4 w-[70%] mx-auto flex flex-col gap-2 mt-2 shadow-[0px_0px_2px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] rounded-sm border border-input'>
                    <p className='text-xl'>{activePoll.pollQuestion}</p>
                    {activePoll.options.map((option, idx) => {      
                        const isSelected = selected === option.id
                        return (
                            <label key={idx} className={`rounded-md p-2 flex items-center gap-1.5 cursor-pointer transition-colors ${isSelected ? 'bg-green-800 text-white' : 'bg-input text-foreground'}`}>
                                <input 
                                    type="radio" 
                                    name='poll' 
                                    // disabled={alreadyVoted}
                                    className={`appearance-none w-3 h-3 rounded-full border-2 ${isSelected? "border-white": "border-green-600"} checked:bg-green-800`} checked={isSelected} onChange={() => setSelected(option.id)} 
                                />
                                <span className='text-lg'>{option.text}</span>
                            </label>
                        )
                    })}      
                </div>
                {/* {alreadyVoted && (
                    <p className="text-green-600 text-sm mt-2">You have already voted.</p>
                )} */}

                <div className='flex gap-2 mt-4'>
                    <Button
                        variant={"default"}
                        className='px-4 py-2 rounded-sm disabled:opacity-50'
                        onClick={handlePollVote}
                        // disabled={selected === null}
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UserPoll