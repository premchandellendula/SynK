import Image from 'next/image'
import React from 'react'

const QuestionsIcon = () => {
    return (
        <div className='bg-violet-50 dark:bg-neutral-900/50 blur-[2px] p-3 rounded-2xl w-fit h-fit rotate-20 animate-[tofro_4s_ease-in-out_infinite]'>
            <Image src={'/question-mark.png'} width={50} height={50} alt='poll png' className='' />
        </div>
    )
}

export default QuestionsIcon