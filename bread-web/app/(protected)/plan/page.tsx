import { redirect } from 'next/navigation'

const Plan = () => {
    const date = new Date()
    const month = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    redirect(`/plan/${month}`)
}

export default Plan