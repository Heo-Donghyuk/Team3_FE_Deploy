"use client"
import { useCallback, useRef, useEffect, MouseEventHandler } from "react"
import { useRouter } from "next/navigation"

interface Props {
  children: React.ReactNode
}

function Modal({ children }: Props) {
  const overlay = useRef(null)
  const wrapper = useRef(null)
  const router = useRouter()

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  const onClick: MouseEventHandler = useCallback(
    (e) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss()
      }
    },
    [onDismiss, overlay, wrapper],
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss()
    },
    [onDismiss],
  )

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onKeyDown])

  return (
    <div ref={overlay} className="fixed z-10 left-0 right-0 top-0 bottom-0 flex items-center justify-center ">
      <div ref={wrapper} className="relative bg-white rounded-2xl p-10 border-[#868484] shadow-2xl">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 focus:outline-none"
          onClick={onDismiss}
          aria-label="Modal Close"
        >
          X
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
