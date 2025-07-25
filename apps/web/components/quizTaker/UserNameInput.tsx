import React from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { User } from 'lucide-react'

const UserNameInput = () => {
    return (
        <div className='flex items-center gap-2 bg-input/70 rounded-md p-2 mt-4'>
            <div className='bg-card/40 p-2 rounded-full'>
                <User size={16} />
            </div>
            <input
                placeholder='Enter your Name'
                className='text-xl w-full outline-none border-none'
            />
            <Button className='rounded-full w-18'>Join</Button>
        </div>
    )
}

export default UserNameInput