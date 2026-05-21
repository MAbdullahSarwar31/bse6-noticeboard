import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'

export function useNotices(session) {
  const [notices, setNotices]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const channelRef              = useRef(null)

  /* ── Fetch all notices (newest first) with profile join ── */
  const fetchNotices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('notices')
        .select(`
          id, title, body, category, created_at, user_id,
          profiles ( display_name, email )
        `)
        .order('created_at', { ascending: false })
      if (err) throw err
      setNotices(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Realtime subscription ── */
  useEffect(() => {
    fetchNotices()

    const channel = supabase
      .channel('public:notices')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notices' },
        async (payload) => {
          // Fetch full row with profile join for the new notice
          const { data } = await supabase
            .from('notices')
            .select(`
              id, title, body, category, created_at, user_id,
              profiles ( display_name, email )
            `)
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setNotices(prev => [data, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notices' },
        (payload) => {
          setNotices(prev => prev.filter(n => n.id !== payload.old.id))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchNotices])

  /* ── Delete a notice ── */
  const deleteNotice = useCallback(async (id) => {
    try {
      const { error: err } = await supabase
        .from('notices')
        .delete()
        .eq('id', id)
      if (err) throw err
      setNotices(prev => prev.filter(n => n.id !== id))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [])

  /* ── Post a notice ── */
  const postNotice = useCallback(async ({ title, body, category }) => {
    if (!session) return { success: false, message: 'Not signed in' }
    try {
      const { error: err } = await supabase
        .from('notices')
        .insert({
          title,
          body,
          category,
          user_id: session.user.id,
        })
      if (err) throw err
      return { success: true }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }, [session])

  return { notices, loading, error, postNotice, deleteNotice }
}
