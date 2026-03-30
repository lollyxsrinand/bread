import { cn } from "@/utils/cn"

const TextButton = ({ className }: { className: string }) => {
    return (
        <button className={cn("px-4 py-2", className)}>

        </button>
    )
}

export default TextButton