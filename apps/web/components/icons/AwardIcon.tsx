import { Award } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const AwardIcon = () => {
    return (
        <div className='bg-violet-50 dark:bg-neutral-900/50 blur-[3px] p-3 rounded-2xl w-fit h-fit -rotate-35 animate-[tofro_4s_ease-in-out_infinite]'>
            <Image src={'/badge.png'} width={50} height={50} alt='poll png' className='' />
        </div>
    )
}

export default AwardIcon