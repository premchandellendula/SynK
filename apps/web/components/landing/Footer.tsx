import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import React from 'react'
import Logo from '../ui/Logo';
import { Button } from '../ui/button';

const Footer = () => {
    const navigation = {
        company: [
            { name: "About", href: "#about" },
            { name: "Blog", href: "#blog" },
            { name: "Careers", href: "#careers" },
            { name: "Press", href: "#press" },
            { name: "Partners", href: "#partners" },
            { name: "Contact", href: "#contact" }
        ],
    }

    const socialLinks = [
        { name: "Twitter", icon: Twitter, href: "#" },
        { name: "LinkedIn", icon: Linkedin, href: "#" },
        { name: "GitHub", icon: Github, href: "#" },
        { name: "Email", icon: Mail, href: "#" }
    ];
    return (
        <footer className='px-6 md:px-12 mt-20'>
            <div className='flex flex-col md:flex-row justify-between mb-8'>
                <div className='flex flex-col'>
                    <div className='flex items-center'>
                        <div className='flex'>
                            <Logo size={15} />
                        </div>
                        <span className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
                            SynK
                        </span>
                    </div>
                    <p className="text-foreground/70 text-lg leading-relaxed max-w-md ml-2 mb-4">
                        Transform your presentations into interactive experiences that captivate, engage, and inspire your audience like never before.
                    </p>

                    <div className="space-y-3 ml-2">
                        <div className="flex items-center space-x-3 text-foreground/60">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span>Hyderabad, India</span>
                        </div>
                        <div className="flex items-center space-x-3 text-foreground/60">
                            <Phone className="h-5 w-5 text-primary" />
                            <span>+91 9876543210</span>
                        </div>
                        <div className="flex items-center space-x-3 text-foreground/60">
                            <Mail className="h-5 w-5 text-primary" />
                            <span>admin@synk.com</span>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-2 ml-2">
                        {socialLinks.map((social) => (
                            <Button
                                key={social.name}
                                variant="ghost"
                                size="sm"
                                className="w-12 h-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                                asChild
                            >
                                <a href={social.href} aria-label={social.name}>
                                <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                                </a>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className='ml-2 mt-4'>
                    <h3 className="font-bold text-lg text-foreground mb-4">Company</h3>
                    <ul className="space-y-3">
                        {navigation.company.map((item) => (
                            <li key={item.name}>
                                <a 
                                    href={item.href} 
                                    className="text-foreground/70 hover:text-primary transition-colors duration-300 text-sm"
                                    >
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className='text-center flex flex-col md:flex-row gap-2 items-center justify-between px-4 py-2'>
                <span className='text-sm'>&copy; {new Date().getFullYear()} SynK. All rights reserved.</span>
                <span>Made with ❤️ by prem</span>
                <span>
                    <ul className='flex text-sm gap-6'>
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                    </ul>
                </span>
            </div>
        </footer>
    )
}

export default Footer