import { Poll, PollStore, PollVote } from "@/types/types";
import { PollStatus } from "@repo/db";
import { create } from "zustand";

const usePollStore = create<PollStore>((set) => ({
    polls: [],
    activePoll: null,
    setPolls: (polls: Poll[]) => set({polls}),
    setActivePoll: (poll) => set({ activePoll: poll }),
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

export default usePollStore;

/*
const usePollStore = create((set) => ({
  activePoll: null,
  setActivePoll: (poll) => set({ activePoll: poll }),
}));

type PollStore = {
  polls: Poll[];
  activePoll: Poll | null;
  setPolls: (polls: Poll[]) => void;
  setActivePoll: (poll: Poll | null) => void;
};
*/

/*
no even for socket events, there will "add-poll" which takes the poll data(question, options, roomId) and creates a poll and add to the polls[] store, the socket event "launch-new-poll" takes the data(question, options, roomId) and it will set the status to Launched and emits to everyone, and there will be another event "launch-existing-poll" which takes the data(pollId) and sets the status to launched and broadcasts to everyone, then there will be "vote-poll"(takes pollId, optionId) and there is "end-poll"(takes roomId, pollId), and "remove-poll", the things in "" are events.

*/