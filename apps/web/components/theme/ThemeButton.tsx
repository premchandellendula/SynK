"use client"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const ThemeButton = () => {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null;

    return (
        <button className="flex items-center h-9 w-9 justify-center rounded-full cursor-pointer hover:bg-accent"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? (
                <Moon className="h-6 w-6 text-foreground/80" />
            ) : (
                <Sun className="h-6 w-6 text-foreground" />
            )}
        </button>
    )
}

export default ThemeButton;