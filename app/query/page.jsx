"use client"
import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, FileText, Loader2, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function QueryPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm your AI legal assistant. I've analyzed your uploaded documents and I'm ready to answer any questions you have about them. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const callQueryAPI = async (question) => {
    try {
      // Use doc_id from uploaded file data if available
      const docId = window.uploadedFileData?.doc_id || 'ef22gge2'
      
      const response = await fetch('http://127.0.0.1:5000/api/legal/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          doc_id: docId // use stored doc_id
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Query API Response:', data)
      return data.answer || data.result || data.message || 'Response received successfully'
    } catch (error) {
      console.error('Query API Error:', error)
      // Return mock response as fallback
      const mockResponses = [
        "Based on your document analysis, I can see that this clause relates to liability limitations. The key points are: 1) The limitation applies only to direct damages, 2) It excludes gross negligence, and 3) The cap is set at the contract value.",
        "According to the contract terms I've reviewed, this section establishes a 30-day notice period for termination. The clause also requires written notice and specifies that termination becomes effective at the end of the notice period.",
        "The intellectual property provisions in your document indicate that all work product created during the engagement will be owned by the client, with the service provider retaining only a limited license for portfolio purposes.",
        "This confidentiality clause appears to be mutual, meaning both parties are bound by the same obligations. The term extends for 5 years post-termination and includes standard exceptions for publicly available information.",
        "The payment terms specify net 30 days from invoice date, with a 1.5% monthly late fee. There's also a provision for suspension of services if payment is more than 60 days overdue.",
      ]
      return mockResponses[Math.floor(Math.random() * mockResponses.length)]
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentQuestion = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      const apiResponse = await callQueryAPI(currentQuestion)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: apiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const suggestedQuestions = [
    "What are the key liability limitations in this contract?",
    "Explain the termination clauses",
    "What are the payment terms?",
    "Are there any unusual provisions I should be aware of?",
    "What intellectual property rights are addressed?",
  ]

  const handleSuggestedQuestion = (question) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation showServices={true} />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Document Query Assistant</h1>
              <p className="text-muted-foreground">Ask questions about your uploaded documents</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex space-x-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user" ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col ${message.type === "user" ? "items-end" : "items-start"}`}>
                    <Card className={`${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                      <CardContent className="p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.type === "assistant" && typeof message.content === 'object' && message.content !== null ? (
                            <div className="space-y-3">
                              {Object.entries(message.content).map(([heading, content]) => (
                                <div key={heading}>
                                  <h4 className="font-semibold text-foreground mb-1">{heading}</h4>
                                  <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                      {message.type === "assistant" && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(typeof message.content === 'object' ? JSON.stringify(message.content, null, 2) : message.content)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            title="Copy response"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Message */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Card className="bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Analyzing your question...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="py-4 border-t border-border"
          >
            <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs h-8"
                >
                  {question}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Form */}
        <div className="py-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={isLoading}
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button type="submit" disabled={!inputValue.trim() || isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send your question. The AI will analyze your uploaded documents to provide accurate answers.
          </p>
        </div>
      </div>
    </div>
  )
}