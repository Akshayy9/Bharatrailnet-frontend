import React, { useState, useEffect } from 'react'

let showToast = null

const Toast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    showToast = (message, type = 'info') => {
      setToast({ show: true, message, type })
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 4000)
    }
  }, [])

  if (!toast.show) return null

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  }

  return (
    <div className={`fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 z-50 ${colors[toast.type]}`}>
      <p>{toast.message}</p>
    </div>
  )
}

export { showToast }
export default Toast
