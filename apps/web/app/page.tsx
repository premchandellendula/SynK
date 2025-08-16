import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

export default async function Home() {
    return (
        <div className="min-h-screen">
            <Header />
            <Hero />
            <Features />
            <Footer />
        </div>
    )
}
