"use client"
import { Archive, BarChart2, EllipsisVerticalIcon, Plus, Trash2, Users, Video } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import PollsIcon from '../icons/PollsIcon'
import AwardIcon from '../icons/AwardIcon'
import QuestionsIcon from '../icons/QuestionsIcon';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CrossIcon from '../icons/CrossIcon'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import useRoomStore from '@/store/roomStore'
import Spinner from '../loaders/Spinner'
import { useSocket } from '@/hooks/useSocket'
import { useUser } from '@/hooks/useUser'
import Dates from '../utils/Dates'
import { RoomType } from '@/types/types'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

const statusConfig = {
    LAUNCHED: { label: "Live", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" },
    // scheduled: { label: "Scheduled", color: "bg-blue-500", textColor: "text-blue-700", bgColor: "bg-blue-50" },
    ENDED: { label: "Completed", color: "bg-gray-500", textColor: "text-gray-700", bgColor: "bg-gray-50" },
}

const SpaceOptions = () => {
    const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
    const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);
    const [rooms, setRooms] = useState<RoomType[]>([])
    const [loading, setLoading] = useState(false)

    const fetchRooms = async () => {
        setLoading(true)
        try{
            const response = await axios.get(`/api/room/`, {
                withCredentials: true
            })
            console.log(response.data.rooms)
    
            setRooms(response.data.rooms[0].rooms)
        }catch(err){
            let errorMessage = "Something went wrong"

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data?.message || err.message;
            }
            console.log("Error signing up: ", err)
            toast.error(errorMessage)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchRooms()
    }, [])

    if(loading){
        return (
            <div className='flex justify-center items-center h-full'>
                <Spinner />
            </div>
        )
    }
    
    return (
        <div className='flex-1 overflow-auto'>
            <div className="max-w-7xl mx-auto p-2 h-full">
                {(rooms && rooms.length > 0) ? (
                    <SpacesList 
                        rooms={rooms}
                        setIsCreateRoomModalOpen={setIsCreateRoomModalOpen}
                        setIsJoinRoomModalOpen={setIsJoinRoomModalOpen}
                        isCreateRoomModalOpen={isCreateRoomModalOpen}
                        isJoinRoomModalOpen={isJoinRoomModalOpen}
                    />
                ) : (
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

                        {isCreateRoomModalOpen && <CreateRoomModal setIsCreateRoomModalOpen={setIsCreateRoomModalOpen} />}

                        {isJoinRoomModalOpen && <JoinRoomModal setIsJoinRoomModalOpen={setIsJoinRoomModalOpen} />}
                    </div>
                )}
            </div>
        </div>
    )
}

interface SpacesListProps {
    rooms: RoomType[],
    isCreateRoomModalOpen: boolean,
    isJoinRoomModalOpen: boolean,
    setIsCreateRoomModalOpen: (val: boolean) => void,
    setIsJoinRoomModalOpen: (val: boolean) => void,
}

function SpacesList({
    rooms, 
    isCreateRoomModalOpen, 
    isJoinRoomModalOpen, 
    setIsCreateRoomModalOpen, 
    setIsJoinRoomModalOpen
}: SpacesListProps){
    const [selectedFilter, setSelectedFilter] = useState("all")
    const [selectedRooms, setSelectedRooms] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false);
    const [loadingforDelete, setLoadingForDelete] = useState(false);
    const [loadingforDeleteAll, setLoadingForDeleteAll] = useState(false);
    const socket = useSocket();
    const router = useRouter();

    const filteredRooms = rooms.filter((room) => {
        if (selectedFilter === "all") return true
        if (selectedFilter === "active") return room.status === "LAUNCHED"
        if (selectedFilter === "past") return room.status === "ENDED"
        return true
    })

    const { user } = useUser();

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRooms([])
        } else {
            const ownRoomIds = filteredRooms
                                .filter(room => room.createdBy.id === user?.id)
                                .map(room => room.id)
            setSelectedRooms(ownRoomIds)
        }
        setSelectAll(!selectAll)
    }

    const handleJoinRoom = async (roomCode: string) => {
        try {
            const response = await axios.post(`/api/room/join`, {
                code: roomCode
            }, {withCredentials: true})
            
            const room = response.data.roomData
            // console.log(response.data.roomData)
            
            const roomInfo = {
                roomId: room.id,
                code: room.code,
                spaceId: room.spaceId,
                name: room.name
            }
            socket.emit("join-room", { roomId: room.id , userId: user?.id });
            useRoomStore.getState().setRoom(roomInfo);
            // console.log(room)

            if(room){
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

    const handleRoomSelect = (roomId: string) => {
        setSelectedRooms((prev) => (prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]))
    }

    const handleDeleteRoom = async (roomId: string) => {
        setLoadingForDelete(true)

        try {
            const response = await axios.delete(`/api/room/${roomId}`, {
                withCredentials: true
            })
        } catch (err) {
            let errorMessage = "Something went wrong"

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data?.message || err.message;
            }
            console.log("Error signing up: ", err)
            toast.error(errorMessage)
        }finally{
            setLoadingForDelete(false)
        }
    }

    const handleDeleteAllRoom = () => {
        
    }
    return (
        <div className='flex flex-col h-full gap-6 p-4'>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedFilter === "all" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("all")}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={selectedFilter === "active" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("active")}
                        size="sm"
                    >
                        <Video className="h-4 w-4 mr-2" />
                        Active & Upcoming
                    </Button>
                    <Button
                        variant={selectedFilter === "past" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("past")}
                        size="sm"
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        Completed
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                        setIsJoinRoomModalOpen(!isJoinRoomModalOpen)
                    }}>
                        <Users className="h-4 w-4 mr-2" />
                        Join Space
                    </Button>
                    <Button size="sm" onClick={() => setIsCreateRoomModalOpen(!isCreateRoomModalOpen)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Space
                    </Button>
                </div>
            </div>

            {isCreateRoomModalOpen && <CreateRoomModal setIsCreateRoomModalOpen={setIsCreateRoomModalOpen} />}

            {isJoinRoomModalOpen && <JoinRoomModal setIsJoinRoomModalOpen={setIsJoinRoomModalOpen} />}

            <div className='flex flex-col border border-input rounded-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]'>
                <div className='p-6'>
                    <div className="flex items-center justify-between">
                        <h3 className='font-semibold'>Your Spaces</h3>
                        <Badge variant="secondary">{filteredRooms.length} space{filteredRooms.length === 1 ? "" : "s"}</Badge>
                    </div>
                </div>
                <div className=''>
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                        <div className="col-span-1 flex items-center">
                            <Input type='checkbox' className='w-5 h-5 accent-green-500' checked={selectAll} onChange={handleSelectAll} />
                        </div>
                        <div className="col-span-5">Space Details</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-2">Participants</div>
                        <div className="col-span-1">Actions</div>
                    </div>
                    <div className="divide-y divide-border">
                        {rooms.map((room) => (
                            <div key={room.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                                {selectedRooms.length > 0 && (
                                    <div className="fixed top-37 left-1/2 transform -translate-x-1/2 z-50">
                                        <div className="bg-popover border border-border shadow-md rounded-md px-6 py-4 flex items-center gap-4">
                                            <p className="text-sm text-foreground">
                                                Delete {selectedRooms.length} space{selectedRooms.length > 1 ? "s" : ""} selected?
                                            </p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleDeleteAllRoom}
                                                disabled={loadingforDeleteAll}
                                                className='w-18'
                                            >
                                                {loadingforDeleteAll ? ( <Spinner /> ) : "Delete"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                setSelectedRooms([]);
                                                setSelectAll(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-1 flex items-center">
                                    {user?.id === room.createdBy.id && (
                                        <Input 
                                            type='checkbox' 
                                            className='w-5 h-5 accent-green-500'
                                            checked={selectedRooms.includes(room.id)}
                                            onChange={() => handleRoomSelect(room.id)}
                                        />
                                    )}
                                </div>
                                <div className="col-span-5 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{room.name}</span>
                                        <span className="text-sm text-muted-foreground">(#{room.code})</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground"><Dates startDate={room.startDate} endDate={room.endDate} /></div>
                                </div>
                                <div className="col-span-3 flex items-center">
                                    <Badge
                                        variant="secondary"
                                        className={`${statusConfig[room.status as keyof typeof statusConfig].bgColor} ${statusConfig[room.status as keyof typeof statusConfig].textColor} border-0`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full ${statusConfig[room.status as keyof typeof statusConfig].color} mr-2`}
                                        />
                                        {statusConfig[room.status as keyof typeof statusConfig].label}
                                    </Badge>
                                </div>
                                <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                                    <Users className="h-4 w-4 mr-1" />
                                    {room.users.length}
                                </div>
                                <div className="col-span-1 flex items-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <EllipsisVerticalIcon size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        {(() => {
                                            const isOwner = user?.id === room.createdBy.id;
                                            const isRoomActive = new Date(room.endDate) > new Date();

                                            if (!isOwner && !isRoomActive) return null;
                                            return (
                                                <DropdownMenuContent align='end'>
                                                    {isOwner && isRoomActive && (
                                                        <DropdownMenuItem onClick={() => handleJoinRoom(room.code)}>
                                                            <Users className='h-4 w-4 mr-2' />
                                                            Join
                                                        </DropdownMenuItem>
                                                    )}

                                                    {!isOwner && isRoomActive && (
                                                        <DropdownMenuItem onClick={() => handleJoinRoom(room.code)}>
                                                            <Users className="h-4 w-4 mr-2" />
                                                            Join
                                                        </DropdownMenuItem>
                                                    )}

                                                    {isOwner && !isRoomActive && (
                                                        <DropdownMenuItem>
                                                            <BarChart2 className="h-4 w-4 mr-2" />
                                                            Analytics
                                                        </DropdownMenuItem>
                                                    )}

                                                    {isOwner && (
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRoom(room.id)}>
                                                            {loadingforDelete ? (
                                                                <Spinner />
                                                            ) : (
                                                                <>
                                                                    <Trash2 className="h-4 w-4 mr-2 hover:text-destructive" />
                                                                    Delete
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            )
                                        })()}
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function JoinRoomModal({ setIsJoinRoomModalOpen }: { setIsJoinRoomModalOpen: (val: boolean) => void}){
    const [joinLoading, setJoinLoading] = useState(false)
    const [roomCode, setRoomCode] = useState("");
    const router = useRouter();
    const socket = useSocket();
    const { user } = useUser();
    const handleJoinRoom = async () => {
        setJoinLoading(true)
        try {
            const response = await axios.post(`/api/room/join`, {
                code: roomCode
            }, {withCredentials: true})
            
            const room = response.data.roomData
            // console.log(response.data.roomData)
            
            const roomInfo = {
                roomId: room.id,
                code: room.code,
                spaceId: room.spaceId,
                name: room.name
            }
            socket.emit("join-room", { roomId: room.id , userId: user?.id });
            useRoomStore.getState().setRoom(roomInfo);
            // console.log(room)

            if(room){
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
        }finally{
            setJoinLoading(false)
        }
    }
    return (
        <div className='fixed inset-0 min-h-screen w-full flex justify-center items-center z-50 bg-black/80'>
            <div className='bg-popover p-4 rounded-lg w-[25rem]'>
                <div className='flex items-center justify-between'>
                    <h3 className='font-semibold text-lg'>Join Space</h3>
                    <CrossIcon onClick={() => setIsJoinRoomModalOpen(false)} />
                </div>
                <div className='flex gap-2 mt-6'>
                    <Input onChange={(e) => setRoomCode(e.target.value)} placeholder='45REM77PC' className='h-10' />
                    <Button onClick={handleJoinRoom} size={'lg'} className='flex justify-center items-center w-18'>
                        {joinLoading ? (
                            <Spinner />
                        ) : (
                            "Join"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function CreateRoomModal({ setIsCreateRoomModalOpen }: { setIsCreateRoomModalOpen: (val: boolean) => void}){
    const [creationLoading, setCreationLoading] = useState(false)
    const [roomName, setRoomName] = useState("");
    const socket = useSocket();
    const router = useRouter();
    const { user } = useUser();

    const handleRoomCreation = async () => {
        setCreationLoading(true)
        try {
            const response = await axios.post(`/api/room/`, {
                name: roomName
            }, { withCredentials: true })
            const room = response.data.roomData
            // console.log(room)
            useRoomStore.getState().setRoom({
                roomId: room.id,
                name: room.name,
                code: room.code,
                spaceId: room.spaceId
            });

            socket.emit("join-room", { roomId: room.id , userId: user?.id });
            if(room){
                router.push(`/space/${room.spaceId}/host`)
            }
            
            toast.success("Room created successfully")
        } catch (err) {
            let errorMessage = "Something went wrong"

            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data?.message || err.message;
            }
            console.log("Error signing up: ", err)
            toast.error(errorMessage)
        }finally{
            setCreationLoading(false)
        }
    }
    return (
        <div className='fixed inset-0 min-h-screen w-full flex justify-center items-center z-50 bg-black/80'>
                <div className='bg-popover p-4 rounded-lg w-[25rem]'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-lg'>Create Space</h3>
                        <CrossIcon onClick={() => setIsCreateRoomModalOpen(false)} />
                    </div>
                    <div className='my-4 flex flex-col gap-1'>
                        <label>Name your space</label>
                        <Input onChange={(e) => setRoomName(e.target.value)} placeholder='space name' />
                    </div>
                    <div className='flex justify-end'>
                        <Button onClick={handleRoomCreation} size={'lg'} className='flex justify-center items-center w-32'>
                            {creationLoading ? (
                                <Spinner />
                            ) : (
                                "Create Space"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
    )
}

export default SpaceOptions