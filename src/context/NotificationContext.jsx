import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import api from '../utils/axios'
import toast from 'react-hot-toast'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [socket, setSocket]               = useState(null)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {}
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!user) return
    const s = io(import.meta.env.VITE_SOCKET_URL || 'https://placement-backend-wd6x.onrender.com/api', {
      auth: { token: localStorage.getItem('token') }
    })
    s.emit('join', user._id)
    s.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev])
      setUnreadCount(prev => prev + 1)
      toast(notif.message, { icon: '🔔', duration: 4000 })
    })
    s.on('application-update', () => fetchNotifications())
    s.on('interview-scheduled', () => fetchNotifications())
    setSocket(s)
    return () => s.disconnect()
  }, [user, fetchNotifications])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, socket }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
