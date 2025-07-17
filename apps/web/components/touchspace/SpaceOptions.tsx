import { Plus, Users } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import PollsIcon from '../icons/PollsIcon'
import AwardIcon from '../icons/AwardIcon'
import QuestionsIcon from '../icons/QuestionsIcon'

const SpaceOptions = () => {
    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-20 relative">
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
                <div className='bg-violet-100 dark:bg-neutral-900/50 rounded-full h-96 w-96 absolute -left-22 -top-12 -z-10'></div>
                <div className="group bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden p-3">
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
                            Create New Room
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Start a new room and invite others to join. You'll be the host with full control over the room settings.
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
                <div className='bg-violet-100 dark:bg-neutral-900/50 rounded-full h-96 w-96 absolute -right-22 -bottom-12 -z-10'></div>
                <div className="group bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden p-3">
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
                            Join Existing Room
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Enter a room code or select from available rooms to join an ongoing session with other participants.
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
        </div>
    )
}

export default SpaceOptions