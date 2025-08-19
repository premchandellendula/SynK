import { useUser } from '@/hooks/useUser';
import { LogOutIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react'

const Flyout = ({setIsFlyoutOpen}: {setIsFlyoutOpen: (value: boolean) => void}) => {
    const { logout } = useUser();
    const ref = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if(ref.current && !ref.current.contains(event.target as Node)){
            setIsFlyoutOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
    return (
        <div ref={ref} className="absolute right-6 top-14 bg-card shadow-md text-foreground rounded-md w-36 py-2 px-2 z-50 flex flex-col gap-y-1">
            <div onClick={() => logout()} className="flex items-center justify-between gap-2 hover:bg-input/30 rounded-md p-2 cursor-pointer">
                <LogOutIcon size={16} />
                <span className="text-base">Logout</span>
            </div>
        </div>
    )
}

export default Flyout