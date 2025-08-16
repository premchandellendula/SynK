import { Brain, ChartNoAxesColumn, Clock, MessageSquare, Target, Trophy, Users, Zap } from 'lucide-react';
import React from 'react'
import { Badge } from '../ui/badge';

const Features = () => {
    const primaryFeatures = [
        {
            icon: MessageSquare,
            title: "Interactive Q&A",
            description: "Enable real-time audience questions with advanced moderation tools. Filter, prioritize, and respond to questions seamlessly while maintaining engagement flow.",
            benefits: ["Real-time moderation", "Smart filtering", "Audience voting", "Archive management"]
        },
        {
            icon: ChartNoAxesColumn,
            title: "Live Polling",
            description: "Create instant polls with multiple question types and see results in real-time. Perfect for decision-making and gathering instant audience feedback.",
            benefits: ["Multiple question types", "Instant results", "Anonymous voting", "Export analytics"]
        },
        {
            icon: Brain,
            title: "Engaging Quizzes",
            description: "Build interactive quizzes with rich media support and detailed analytics. Track performance and create memorable learning experiences.",
            benefits: ["Rich media support", "Auto-grading", "Performance analytics", "Adaptive difficulty"]
        },
        {
            icon: Trophy,
            title: "Dynamic Leaderboards",
            description: "Gamify your events with competitive leaderboards that update in real-time. Drive engagement through friendly competition and recognition.",
            benefits: ["Real-time updates", "Custom scoring", "Team competitions", "Achievement badges"]
        }
    ];

    const secondaryFeatures = [
        { icon: Users, title: "Role-Based Access", desc: "Secure admin and user experiences" },
        { icon: Zap, title: "Real-Time Sync", desc: "Instant updates across all devices" },
        { icon: Target, title: "Smart Analytics", desc: "Detailed engagement insights" },
        { icon: Clock, title: "Event Scheduling", desc: "Automated session management" },
    ];

    return (
        <section className='mt-10'>
            <div className="text-center mb-12">
                <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/20 text-primary bg-primary/5 rounded-full">
                    Powerful Features
                </Badge>
                <h2 className="text-3xl md:text-7xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 bg-clip-text text-transparent">
                        Everything You Need
                    </span>
                    <br />
                    <span className="text-foreground">
                        to Engage Your Audience
                    </span>
                </h2>
                <p className="text-base md:text-2xl text-foreground/70 max-w-sm md:max-w-3xl mx-auto text-center leading-relaxed">
                    Professional-grade tools designed for modern presenters, educators, and event organizers who demand excellence.
                </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-4 mb-24 max-w-7xl w-full px-6 md:px-4 mx-auto">
                {primaryFeatures.map((feature, idx) => (
                    <div 
                        key={feature.title} 
                        className="group overflow-hidden bg-card/40 border border-border/50 hover:border-primary/30 transition-all duration-700 rounded-sm"
                        style={{animationDelay: `${idx * 0.2}s`}}
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-500 group-hover:scale-110">
                                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-foreground/70 text-sm md:text-lg leading-relaxed mb-6">
                            {feature.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                            {feature.benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center space-x-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                <span className="text-foreground/80 font-medium">{benefit}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mb-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                    Plus Many More Advanced Features
                </h3>
                <p className="text-base md:text-lg text-foreground/70 max-w-sm md:max-w-2xl mx-auto">
                    Built for scale with enterprise-grade security and performance
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full px-6 md:px-4 mx-auto mb-10">
                {secondaryFeatures.map((feature, index) => (
                    <div 
                        key={feature.title}
                        className="group bg-card/20 border border-border/50 hover:border-primary/20 hover:bg-card/40 transition-all duration-500 rounded-sm"
                        style={{animationDelay: `${0.8 + index * 0.1}s`}}
                    >
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-300 via-violet-500 to-violet-900 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all duration-500">
                                <feature.icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h4 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                                {feature.title}
                            </h4>
                            <p className="text-foreground/60 text-sm">
                                {feature.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Features