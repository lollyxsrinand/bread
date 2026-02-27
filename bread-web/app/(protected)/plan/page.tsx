import { getCurrentMonthId } from 'bread-core/src'
import { redirect } from 'next/navigation'

const Plan = () => {
    const month = getCurrentMonthId()
    
    redirect(`/plan/${month}`)
}

export default Plan