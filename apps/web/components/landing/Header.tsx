import React from 'react'
import Logo from '../ui/Logo'
import { Button } from '../ui/button'
import Link from 'next/link'

const Header = () => {
    return (
        <div className='w-full h-16 flex justify-between bg-background items-center px-5 md:px-10 border-b border-input/50 fixed z-50'>
            <div className='flex items-center'>
                <Logo size={16} />
                <h2 className='text-2xl md:text-3xl 1 bg-gradient-to-r from-primary to-sidebar-primary/70 text-transparent bg-clip-text font-bold'>SynK</h2>
            </div>
            <div className='flex items-center gap-3'>
                <Link href={"/signin"}>
                    <Button
                        variant={"ghost"}
                        className={`hidden md:block text-[15px]`}
                        >
                        Sign In
                    </Button>
                </Link>
                <Link href={"/signup"}>
                    <Button
                        className='text-sm md:text-base'
                        >
                        Get Started
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default Header