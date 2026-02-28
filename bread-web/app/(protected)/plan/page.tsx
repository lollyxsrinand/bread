import { getCurrentMonthId } from 'bread-core/src'
import { redirect } from 'next/navigation'

const Plan = () => {
    redirect(`/plan/${getCurrentMonthId()}`)
}

export default Plan