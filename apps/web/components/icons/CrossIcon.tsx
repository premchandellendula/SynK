import { X } from 'lucide-react'
import React from 'react'

const CrossIcon = ({onClick}: {onClick: () => void}) => {
    return (
        <X onClick={onClick} className='h-5 w-5 text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-300 cursor-pointer' />
    )
}

export default CrossIcon