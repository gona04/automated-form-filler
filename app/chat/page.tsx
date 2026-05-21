import { ChatWindow } from '@/components/ChatWindow'
import { MessageInput } from '@/components/MessageInput'

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col bg-zinc-50">
      <ChatWindow />
      <MessageInput />
    </main>
  )
}
