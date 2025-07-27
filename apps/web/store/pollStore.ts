import { Poll, PollStore, PollVote } from "@/types/types";
import { PollStatus } from "@repo/db";
import { create } from "zustand";

const usePollStore = create<PollStore>((set) => ({
    polls: [],
    setPolls: (polls: Poll[]) => set({polls}),
    addPoll: (poll: Poll) => 
        set((state) => ({
            polls: [...state.polls, poll]
        })),
    launchPoll: (pollId: string) =>
        set((state) => ({
            polls: state.polls.map((p) => 
                p.id === pollId 
                    ? { ...p, status: PollStatus.LAUNCHED}
                    : { ...p, status: p.status === PollStatus.LAUNCHED ? PollStatus.ENDED : p.status }
            )
        })),
    stopPoll: (pollId: string) => 
        set((state) => ({
            polls: state.polls.map((p) =>
                p.id === pollId ? { ...p, status: PollStatus.ENDED } : p
            ),
        })),
    votePoll: (pollId: string, optionId: string, userId: string) =>
        set((state) => ({
            polls: state.polls.map((p) => {
                if(p.id !== pollId) return p;

                const existingVoteIndex = p.pollVotes.findIndex((vote) => vote.userId === userId)

                let updatedVotes: PollVote[];
                if(existingVoteIndex !== -1){
                    updatedVotes = [...p.pollVotes]
                    updatedVotes[existingVoteIndex] = {
                        userId,
                        pollId,
                        optionId,
                    };
                }else{
                    updatedVotes = [
                        ...p.pollVotes,
                        { userId, pollId, optionId },
                    ];
                }

                return {...p, pollVotes: updatedVotes}
            })
        }))
}))