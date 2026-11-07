import { useEffect, useRef, useState } from 'react'
import './PublicChatbot.css'

const API = 'http://localhost:5000/api'
const suggestions = [
  'How do I register a complaint?',
  'How can I track my complaint?',
  'How do I report a water supply problem?',
  'Which department handles road complaints?'
]

function newId() {
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, character => {
    const random = Math.floor(Math.random() * 16)
    return (character === 'x' ? random : (random & 3) | 8).toString(16)
  })
}

function getSessionId() {
  try {
    const stored = window.localStorage.getItem('dms_chat_session')
    if (stored) return stored
    const id = newId()
    window.localStorage.setItem('dms_chat_session', id)
    return id
  } catch {
    return newId()
  }
}

export default function PublicChatbot({ goToComplaints }) {
  const [sessionId] = useState(getSessionId)
  const [conversationId, setConversationId] = useState(newId)
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/chat/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, sessionId, language })
    }).catch(() => setNotice('Chat service is unavailable. Please try again.'))
  }, [conversationId, language, sessionId])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (suggestedText) => {
    const message = (suggestedText || text).trim()
    if (!message || typing) return
    setText('')
    setMessages(current => [...current, { message, created_at: new Date().toISOString(), pending: true }])
    setTyping(true)
    try {
      const response = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, conversationId, sessionId })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error?.message || 'Unable to get an answer')
      setMessages(current => [...current.slice(0, -1), payload.data])
    } catch (error) {
      setMessages(current => current.slice(0, -1))
      setNotice(error.message || 'Unable to send message.')
    } finally {
      setTyping(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setNotice('')
    setConversationId(newId())
  }

  return <section className="chat-card">
    <header className="citizen-head">
      <div>
        <b>District Citizen Assistant</b>
        <small>Online · Government service assistance</small>
      </div>
      <button type="button" onClick={startNewChat}>New Chat</button>
    </header>
    {notice && <div className="notice" onClick={() => setNotice('')}>{notice}</div>}
    <div className="chat-tools">
      <label>Language <select value={language} onChange={event => setLanguage(event.target.value)}>
        <option value="en">English</option><option value="hi">Hindi</option><option value="hinglish">Hinglish</option>
      </select></label>
      <button type="button" onClick={goToComplaints}>Register Complaint</button>
    </div>
    <div className="citizen-log">
      {!messages.length && <div className="suggestions"><p>How can I help you today?</p>{suggestions.map(item => <button type="button" key={item} onClick={() => sendMessage(item)}>{item}</button>)}</div>}
      {messages.map((item, index) => <div className={item.response ? 'bubble assistant' : 'bubble user'} key={item.id || index}>
        <p>{item.response || item.message}</p>
        <small>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
      </div>)}
      {typing && <div className="bubble assistant">Assistant is typing…</div>}
      <div ref={bottomRef} />
    </div>
    <form className="chat-composer" onSubmit={event => { event.preventDefault(); sendMessage() }}>
      <input value={text} maxLength="2000" onChange={event => setText(event.target.value)} placeholder="Ask about district services…" />
      <button disabled={typing} type="submit">Send</button>
    </form>
  </section>
}
