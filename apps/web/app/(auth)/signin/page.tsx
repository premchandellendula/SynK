"use client"
import Spinner from "@/components/loaders/Spinner"
import BottomWarning from "@/components/ui/BottomWarning"
import { Button } from "@/components/ui/button"
import Heading from "@/components/ui/Heading"
import { Input } from "@/components/ui/input"
import Logo from "@/components/ui/Logo"
import PasswordInput from "@/components/ui/PasswordInput"
import { useUser } from "@/hooks/useUser"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ChangeEvent, useState } from "react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { FcGoogle } from 'react-icons/fc'

const page = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const { login } = useUser();

    const canSubmit = formData.email.trim() !== "" && formData.password.trim() !== "";

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            await axios.post('/api/auth/signin', formData, {
                withCredentials: true
            })

            if(formData.email && formData.password){
                router.push(`/spaces`)
            }
            login();

            toast.success("Signin successful")
        }catch(err) {
            let errorMessage = "Something went wrong";
            if(axios.isAxiosError(err)){
                errorMessage = err.response?.data.message || err.message
            }
            console.log("Error signing up: ", err)
            setError(errorMessage);
            toast.error(errorMessage)
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-card rounded-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] w-96 p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-center">
                            <Logo size={18} />
                        </div>
                        <Heading size="2xl" text="Signin" />
                        <Input placeholder="Email Address" type="email" name="email" id="email" onChange={handleChange} />
                        <PasswordInput placeholder="Password" name="password" id="password" onChange={handleChange} />
                        <Button type="submit">
                            {loading ? (
                                <Spinner />
                            ) : (
                                "Signin"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex items-center justify-center gap-2"
                            onClick={async () => await signIn("google", { callbackUrl: "/spaces" })}
                        >
                            <FcGoogle size={20} />
                            Continue with Google
                        </Button>
                        <BottomWarning label="Doesn't have an account?" buttonText="Signup" to="/signup" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default page