import { useEffect, useState } from 'react'

export const useTrainWebSocket = (sectionId, onMessage) => {
  const [connectionStatus, setConnectionStatus] = useState('Connected')

  useEffect(() => {
    if (!sectionId || !onMessage) return

    // Simulate real-time updates without WebSocket
    const interval = setInterval(() => {
      // Simulate different types of messages
      const messages = [
        {
          type: 'dashboardUpdate',
          data: {
            punctuality: parseFloat((95 + Math.random() * 5).toFixed(1)),
            averageDelay: parseFloat((Math.random() * 10).toFixed(1)),
            throughput: Math.floor(15 + Math.random() * 10)
          }
        },
        {
          type: 'trainPositionUpdate',
          data: {
            trainId: '12004',
            status: 'Moving'
          }
        }
      ]
      
      // Send random message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      onMessage(randomMessage)
    }, 8000) // Every 8 seconds

    return () => clearInterval(interval)
  }, [sectionId, onMessage])

  return {
    connectionStatus: 'Connected',
    sendMessage: (message) => console.log('Mock WebSocket send:', message),
    sendJsonMessage: (message) => console.log('Mock WebSocket send JSON:', message)
  }
}
