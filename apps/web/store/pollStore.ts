import { Poll, PollOption, PollStore, PollVote } from "@/types/types";
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
    removePoll: (pollId: string) => 
        set((state) => ({
            polls: state.polls.filter((p) =>
                p.id !== pollId
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
        })),
    updateOptionVotes: (pollId: string, optionVotes: PollOption[]) =>
        set((state): Partial<PollStore> => {
            const updatedPolls = state.polls.map((poll) =>
                poll.id === pollId
                    ? {
                        ...poll,
                        options: poll.options.map((option) => {
                            const updated = optionVotes.find((o) => o.id === option.id);
                            return updated
                                ? { ...option, voteCount: updated.voteCount }
                                : { ...option };
                        }),
                    }
                    : poll
            );

            const updatedActivePoll =
                state.activePoll?.id === pollId
                    ? {
                        ...state.activePoll,
                        options: state.activePoll.options.map((option) => {
                            const updated = optionVotes.find((o) => o.id === option.id);
                            return updated
                                ? { ...option, voteCount: updated.voteCount }
                                : { ...option };
                        }),
                    }
                    : state.activePoll;

            return {
                polls: updatedPolls,
                activePoll: updatedActivePoll,
            };
        }),
}))

export default usePollStore;