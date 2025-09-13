import { Archive, ArchiveX, MessageSquareMore, X } from 'lucide-react'
import React, { ReactNode, useEffect, useState } from 'react'
import AdminQuestions from './AdminQuestions'
import { AnimatePresence, motion } from 'motion/react'
import ReviewedQuestionCard from './ReviewedQuestionCard'
import useQuestionStore from '@/store/questionStore'
import useRoomStore from '@/store/roomStore'
import axios from 'axios'

const AdminQuestionBox = () => {
    const [isArchiveBoxOpen, setIsArchiveBoxOpen] = useState(false)
    const [isIgnoreBoxOpen, setIsIgnoreBoxOpen] = useState(false)
    
    return (
        <div className='relative h-full w-full'>
            <div className='flex justify-between items-center h-10'>
                <div className='flex items-center gap-1'>
                    <MessageSquareMore size={20} className='mt-1 text-green-500' />
                    <span className='font-normal text-foreground text-lg flex gap-1'><span className='hidden md:block'>Audience</span> Q&A</span>
                </div>
                <div className='flex items-center gap-2'>
                    <MenuItemTab 
                        icon={<Archive size={18} className='mt-1' />} 
                        label={"Archive"} 
                        onClick={() => setIsArchiveBoxOpen(true)} 
                    />

                    <MenuItemTab 
                        icon={<ArchiveX size={18} className='mt-1' />} 
                        label={"Ignored"} 
                        onClick={() => setIsIgnoreBoxOpen(true)} 
                    />
                </div>
            </div>
            <div className='absolute top-12 bottom-4 left-0 right-0 overflow-y-auto p-2'>
                <AdminQuestions />
            </div>

            <AnimatePresence>
                {isArchiveBoxOpen && (
                    <ArchiveSidebar setIsArchiveBoxOpen={setIsArchiveBoxOpen} />
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {isIgnoreBoxOpen && (
                    <IgnoredSidebar setIsIgnoreBoxOpen={setIsIgnoreBoxOpen} />
                )}
            </AnimatePresence>
        </div>
    )
}

export function MenuItemTab({icon, label, onClick}: {icon: ReactNode, label: string, onClick?: () => void}){
    return (
        <div onClick={onClick} className='flex items-center gap-1 cursor-pointer hover:bg-input/40 px-4 py-1 rounded-full'>
            {icon}
            <span className='font-normal text-foreground text-lg'>{label}</span>
        </div>
    )
}

function ArchiveSidebar({setIsArchiveBoxOpen}: {setIsArchiveBoxOpen: (val: boolean) => void}){
    const { archiveQuestions, setArchiveQuestions } = useQuestionStore();
    // console.log("archive questions: ",archiveQuestions)
    const roomId = useRoomStore((state) => state.room?.roomId)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            if(!roomId) return;
            try {
                const response = await axios.get(`/api/room/${roomId}/questions`, {
                    withCredentials: true,
                });
                setArchiveQuestions(response.data.archiveQuestions || []);
            } catch (err) {
                console.error("Failed to fetch questions", err);
            }finally {
                setLoading(false)
            }
        }
        fetchQuestions();
    }, [roomId, setArchiveQuestions])
    return (
        <motion.div 
        key={"archiveSidebar"}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
            type: "spring",
            stiffness: 300,
            damping: 40
        }}
        className='absolute -top-0 -right-2 w-[60%] h-full bg-card p-2 z-30 shadow-sm flex flex-col gap-2'>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-lg'>Archived</h3>
                <div onClick={() => setIsArchiveBoxOpen(false)} className='bg-input/30 hover:bg-input/50 rounded-full p-1'>
                    <X size={16} className='text-foreground cursor-pointer' />
                </div>
            </div>
            <div className='flex-1 overflow-y-auto'>
                {/* <ReviewedQuestionCard /> */}
                {loading ? (
                    <div className='flex justify-center items-center text-foreground h-full'>
                        Loading...
                    </div>
                ) : archiveQuestions.length === 0 ? (
                    <div className='flex justify-center items-center text-foreground h-full'>
                        No Questions yet
                    </div>
                ) : (
                    archiveQuestions.map((q, idx) => (
                        <ReviewedQuestionCard key={idx} question={q} />
                    ))
                )}
            </div>
        </motion.div>
    )
}

function IgnoredSidebar({setIsIgnoreBoxOpen}: {setIsIgnoreBoxOpen: (val: boolean) => void}){
    const {ignoredQuestions, setIgnoredQuestions} = useQuestionStore();
    const roomId = useRoomStore((state) => state.room?.roomId);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchQuestions = async () => {
            if(!roomId) return;
            try {
                const response = await axios.get(`/api/room/${roomId}/questions`, {
                    withCredentials: true,
                });
                setIgnoredQuestions(response.data.ignoredQuestions || []);
            } catch (err) {
                console.error("Failed to fetch questions", err);
            }finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [roomId, setIgnoredQuestions])
    return (
        <motion.div 
        key={"ignoredSidebar"}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
            type: "spring",
            stiffness: 300,
            damping: 40
        }}
        className='absolute -top-0 -right-2 w-[60%] h-full bg-card p-2 z-30 shadow-sm flex flex-col gap-2'>
            <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-lg'>Ignored</h3>
                <div onClick={() => setIsIgnoreBoxOpen(false)} className='bg-input/30 hover:bg-input/50 rounded-full p-1'>
                    <X size={16} className='text-foreground cursor-pointer' />
                </div>
            </div>
            <div className='flex-1 overflow-y-auto'>
                {/* <ReviewedQuestionCard /> */}
                {loading ? (
                    <div className='flex justify-center items-center text-foreground h-full'>
                        Loading...
                    </div>
                ) : ignoredQuestions.length === 0 ? (
                    <div className='flex justify-center items-center text-foreground h-full'>
                        No Questions yet
                    </div>
                ) : (
                    ignoredQuestions.map((q, idx) => (
                        <ReviewedQuestionCard key={idx} question={q} />
                    ))
                )}

            </div>
        </motion.div>
    )
}

export default AdminQuestionBox