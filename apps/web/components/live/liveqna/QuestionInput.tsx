import React, { useState } from 'react'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import useRoomStore from '@/store/roomStore'
import useQuestionStore from '@/store/questionStore'
import { useSocket } from '@/hooks/useSocket'
import { useUser } from '@/hooks/useUser'

const QuestionInput = () => {
    const [text, setText] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const room = useRoomStore((state) => state.room)
    // console.log(room)
    const addQuestion = useQuestionStore((state) => state.addQuestion);
    const socket = useSocket()
    const { user } = useUser(); 

    if (!room) {
        return <div className="p-4 text-center text-gray-500">Loading room...</div>;
    }
    const roomId = room?.roomId;
    // console.log(roomId)

    const handleSend = async () => {
        if(!text.trim() || isLoading) return;
        const questionText = text.trim();
        setText("");
        setIsLoading(true);

        try{
            const response = await axios.post(`/api/room/${roomId}/questions`, {
                question: questionText
            }, {
                withCredentials: true
            })

            const question = response.data.question;
            socket.emit("send-question", {
                roomId, 
                question, 
                sender: user
            })
            addQuestion(question);
        }catch(err){
            console.error('Failed to send question:', err);
            setText(questionText); 
        }finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }
    return (
        <div className='mt-4 border border-input rounded-sm p-2'>
            <Input 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className='h-12 md:h-14 text-base md:text-xl border-none shadow-none focus:ring-0 focus-visible:ring-0 focus:outline-none' placeholder='Type your question' 
            />
            <div className='flex justify-between mt-3'>
                <div className='flex items-center gap-1'>
                    <div className='h-8 w-8 bg-neutral-500 rounded-full'></div>
                    <div className='flex'>
                        <span>{user?.name}</span>
                        <ChevronDown className='mt-1 cursor-pointer' size={20} />
                    </div>
                </div>
                <Button onClick={handleSend} className='w-24 rounded-full'>Send</Button>
            </div>
        </div>
    )
}

export default QuestionInput