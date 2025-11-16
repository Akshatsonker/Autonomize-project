import ChatInterface from '@/components/chat-interface'

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Team Activity Monitor</h1>
          <p className="text-muted-foreground">Ask about your team's work on JIRA and GitHub</p>
        </div>
        <ChatInterface />
      </div>
    </main>
  )
}
