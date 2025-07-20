"use client"
import { Plus, Users } from 'lucide-react'
import Image from 'next/image'
import React, { ChangeEvent, useState } from 'react'
import PollsIcon from '../icons/PollsIcon'
import AwardIcon from '../icons/AwardIcon'
import QuestionsIcon from '../icons/QuestionsIcon';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CrossIcon from '../icons/CrossIcon'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SpaceOptions = () => {
    const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
    const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const router = useRouter();
    const handleRoomCreation = async () => {
        try {
            const response = await axios.post(`/api/room/`, {
                name: roomName
            }, { withCredentials: true })
            const room = response.data.roomData
            // console.log(room)
            if(room.id){
                router.push(`/space/${room.spaceId}`)
            }
            toast.success("Room created successfully")
        } catch (err) {
            let errorMessage = "Something went wrong"

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data?.message || err.message;
            }
            console.log("Error signing up: ", err)
            toast.error(errorMessage)
        }
    }

    const handleJoinRoom = async () => {
        try {
            const response = await axios.post(`/api/room/join`, {
                code: roomCode
            }, {withCredentials: true})

            const room = response.data.roomData
            // console.log(room)
            if(room.id){
                router.push(`/space/${room.spaceId}/live`)
            }
            toast.success("Joined room successfully")
        }catch(err) {
            let errorMessage = "Something went wrong"

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data?.message || err.message;
            }
            console.log("Error signing up: ", err)
            toast.error(errorMessage)
        }
    }
    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-13 relative">
            <div className='absolute -left-40'>
                <PollsIcon />
            </div>
            <div className='absolute -right-40'>
                <AwardIcon />
            </div>
            <div className='absolute -left-30 -bottom-2'>
                <QuestionsIcon />
            </div>
            <div className='relative'>
                <div className='bg-violet-100 dark:bg-neutral-900/50 rounded-full h-96 w-96 absolute -left-22 -top-10 -z-10'></div>
                <div onClick={() => setIsCreateRoomModalOpen(true)} className="group bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden p-3">
                    <div className="relative h-56 overflow-hidden">
                        <Image
                            width={200}
                            height={200}
                            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Person working on laptop creating new project"
                            className="w-full h-full object-cover transition-transform duration-300 rounded-t-2xl"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Plus size={24} className="text-primary group-hover:text-white" />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-accent-foreground mb-2 group-hover:text-primary">
                            Create New SynkSpace
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Start a new space and invite others to join. You'll be the host with full control over the space settings.
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">Get Started</span>
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Plus size={16} className="text-primary group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='relative'>
                <div className='bg-violet-100 dark:bg-neutral-900/50 rounded-full h-96 w-96 absolute -right-22 -bottom-10 -z-10'></div>
                <div onClick={() => setIsJoinRoomModalOpen(true)} className="group bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden p-3">
                    <div className="relative h-56 overflow-hidden">
                        <Image
                            width={200}
                            height={200}
                            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                            alt="Team collaborating on laptops in meeting"
                            className="w-full h-full object-cover transition-transform duration-300 rounded-t-2xl"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Users size={24} className="text-primary group-hover:text-white" />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-accent-foreground mb-2 group-hover:text-primary">
                            Join Existing Space
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Enter a space code or select from available spaces to join an ongoing session with other participants.
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary">Join Now</span>
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                                <Users size={16} className="text-primary group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCreateRoomModalOpen && <div className='fixed inset-0 min-h-screen w-full flex justify-center items-center z-50 bg-black/80'>
                <div className='bg-popover p-4 rounded-lg w-[25rem]'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg'>Create Space</h3>
                        <CrossIcon onClick={() => setIsCreateRoomModalOpen(!isCreateRoomModalOpen)} />
                    </div>
                    <div className='my-4 flex flex-col gap-1'>
                        <label>Name your space</label>
                        <Input onChange={(e) => setRoomName(e.target.value)} placeholder='space name' />
                    </div>
                    <div className='flex justify-end'>
                        <Button onClick={handleRoomCreation} size={'lg'}>Create Space</Button>
                    </div>
                </div>
            </div>}

            {isJoinRoomModalOpen && <div className='fixed inset-0 min-h-screen w-full flex justify-center items-center z-50 bg-black/80'>
                <div className='bg-popover p-4 rounded-lg w-[25rem]'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg'>Join Space</h3>
                        <CrossIcon onClick={() => setIsJoinRoomModalOpen(false)} />
                    </div>
                    <div className='flex gap-2 mt-6'>
                        <Input onChange={(e) => setRoomCode(e.target.value)} placeholder='45REM77PC' className='h-10' />
                        <Button onClick={handleJoinRoom} size={'lg'}>Join</Button>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default SpaceOptions