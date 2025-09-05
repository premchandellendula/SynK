import Navbar from "@/components/navbar/Navbar";
import SpaceOptions from "@/components/touchspace/SpaceOptions";

export default function Spaces(){
    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <SpaceOptions />            
        </div>
    )
}