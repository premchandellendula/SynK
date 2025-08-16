import React from 'react'
import { Button } from '../ui/button'
import { Brain, ChartNoAxesColumn, MessageSquare, Trophy } from 'lucide-react'

const Hero = () => {
    return (
        <div className='pt-26 p-10'>
            <div className='space-y-8 ml-2 flex flex-col items-center'>
                <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold leading-[1] animate-fade-in-up text-center'>
                    <span className='bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 bg-clip-text text-transparent'>Engage</span>
                    <span className='block text-foreground/90'>Your Audience</span>
                    <span className="block bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 bg-clip-text text-transparent">Like Never Before</span>
                </h1>
                <p className="text-xl md:text-2xl lg:text-[1.65rem] text-foreground/70 max-w-4xl leading-relaxed animate-fade-in-up text-center" style={{animationDelay: '0.2s'}}>
                    Transform presentations into interactive experiences with{" "}
                    <span className="text-sidebar-ring font-semibold">real-time Q&A</span>,{" "}
                    <span className="text-sidebar-ring font-semibold">live polls</span>, and{" "}
                    <span className="text-sidebar-ring font-semibold">engaging quizzes</span>
                </p>
            </div>
            <div className='flex flex-col md:flex-row items-center justify-center gap-3 mt-8 ml-2'>
                <Button
                    size={"lg"}
                    className='px-12 py-6 text-lg transition-all duration-500 ease-spring w-full md:w-auto'
                >
                    Start Free trial
                </Button>
                <Button
                    size={"lg"}
                    className='px-12 py-6 text-lg transition-all duration-500 ease-spring w-full md:w-auto'
                    variant={"outline"}
                >
                    Get Started
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto animate-fade-in-up mt-10" style={{animationDelay: '0.6s'}}>
                {[
                    { icon: MessageSquare, label: "Live Q&A", desc: "Real-time questions" },
                    { icon: ChartNoAxesColumn, label: "Instant Polls", desc: "Immediate feedback" },
                    { icon: Brain, label: "Smart Quizzes", desc: "Engaging challenges" },
                    { icon: Trophy, label: "Leaderboards", desc: "Competitive fun" }
                ].map((feature, index) => (
                    <div 
                        key={feature.label} 
                        className="group cursor-pointer"
                        style={{animationDelay: `${0.8 + index * 0.1}s`}}
                    >
                        <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-8 border border-border/20 hover:border-primary/30 transition-all duration-500 hover:shadow-glow group-hover:scale-105 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-glow group-hover:shadow-glow-lg transition-all duration-500">
                                <feature.icon className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                                {feature.label}
                            </h3>
                            <p className="text-foreground/60 text-sm font-medium">
                                {feature.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Hero