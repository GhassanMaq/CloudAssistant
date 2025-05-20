import React, { useState, useRef, useEffect } from 'react'
import { LexRuntimeV2Client, RecognizeTextCommand } from '@aws-sdk/client-lex-runtime-v2'
import { fetchAuthSession } from '@aws-amplify/auth'
import awsExports from './aws-exports'
import { generateClient } from '@aws-amplify/api'
import { graphqlOperation } from '@aws-amplify/api-graphql'
import { createConversation } from './graphql/mutations'

const appsync = generateClient()

const lex = new LexRuntimeV2Client({
  region: awsExports.lex.region,
  credentials: async () => {
    const session = await fetchAuthSession()
    return session.credentials
  }
})

export default function LexChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    setInput('')
    setMessages(prev => [...prev, { sender: 'You', text }])

    try {
      const cmd = new RecognizeTextCommand({
        botId: awsExports.lex.botId,
        botAliasId: awsExports.lex.botAliasId,
        localeId: awsExports.lex.localeId,
        sessionId: `user-${Date.now()}`,
        text
      })

      const response = await lex.send(cmd)
      const reply = response.messages?.[0]?.content || '[no response]'

      setMessages(prev => [...prev, { sender: 'Bot', text: reply }])

      await appsync.graphql(
        graphqlOperation(createConversation, {
          input: { userMessage: text, botResponse: reply }
        })
      )
    } catch (error) {
      console.error(error)
      setMessages(prev => [
        ...prev,
        { sender: 'Bot', text: `❌ Error:\n${JSON.stringify(error, null, 2)}` }
      ])
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        height: 300,
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: 10,
        borderRadius: 6
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === 'You' ? 'right' : 'left',
              margin: 5
            }}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <textarea
        rows={2}
        style={{
          width: '100%',
          marginTop: 10,
          padding: 8,
          borderRadius: 4,
          border: '1px solid #ccc'
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask me something..."
      />

      <button
        onClick={sendMessage}
        style={{
          marginTop: 5,
          padding: '8px 16px',
          backgroundColor: '#4A90E2',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Send
      </button>
    </div>
  )
}
