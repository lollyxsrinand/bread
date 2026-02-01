import { useCallback, useState } from 'react'

export function useToggle(initial = false) {
  const [value, setValue] = useState<boolean>(initial)

  // useCallback: memoizes the function to prevent unnecessary re-renders 
  const toggle = useCallback(() => {
    setValue(prev => !prev)
  }, [])

  return { value, toggle, setValue }
}