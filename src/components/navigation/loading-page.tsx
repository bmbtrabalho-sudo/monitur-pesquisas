import { Loader2 } from "lucide-react"

export const LoadingPage = () => {
    return (
        <div className="flex w-full h-screen justify-center items-center">
            <Loader2 size={50} className="animate-spin" />
        </div>
    )
}