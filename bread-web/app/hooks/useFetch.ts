import { useEffect, useState } from "react";

export function useFetch<T = unknown>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET') {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`)
            }
            const result: T = await response.json() as T
            setData(result)
        } catch (err: any) {
            setError(err.message || 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [url])

    return { data, loading, error, refetch: fetchData }
}