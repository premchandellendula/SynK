import { ChartNoAxesColumn } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const PollsIcon = () => {
    return (
        <div className='bg-violet-50 dark:bg-neutral-900/50 blur-[3px] p-3 rounded-2xl w-fit h-fit -rotate-45 animate-[tofro_4s_ease-in-out_infinite]'>
            <Image src={'/poll.png'} width={50} height={50} alt='poll png' className='' />
        </div>
    )
}

export default PollsIcon