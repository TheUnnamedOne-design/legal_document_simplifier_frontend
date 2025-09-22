"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Send, Lightbulb, Copy, Trash2, ZoomIn, ZoomOut, RotateCcw, Download, BookOpen, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SimplifyClausePage() {
  const [selectedText, setSelectedText] = useState("")
  const [notes, setNotes] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fileContent, setFileContent] = useState("")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const pdfViewerRef = useRef(null)

  // Mock PDF content for fallback
  const mockPdfContent = `ARTICLE 5: LIMITATION OF LIABILITY

5.1 GENERAL LIMITATION. EXCEPT AS OTHERWISE PROVIDED IN THIS AGREEMENT, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS AGREEMENT OR THE SERVICES PROVIDED HEREUNDER, EVEN IF SUCH PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

5.2 MONETARY CAP. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, EACH PARTY'S TOTAL CUMULATIVE LIABILITY TO THE OTHER PARTY FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL AMOUNT OF FEES PAID OR PAYABLE BY CLIENT TO SERVICE PROVIDER UNDER THIS AGREEMENT IN THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO SUCH LIABILITY.

5.3 EXCEPTIONS. THE LIMITATIONS SET FORTH IN SECTIONS 5.1 AND 5.2 SHALL NOT APPLY TO: (A) EITHER PARTY'S GROSS NEGLIGENCE OR WILLFUL MISCONDUCT; (B) EITHER PARTY'S BREACH OF CONFIDENTIALITY OBLIGATIONS; (C) CLIENT'S PAYMENT OBLIGATIONS; OR (D) EITHER PARTY'S INDEMNIFICATION OBLIGATIONS.

ARTICLE 6: INDEMNIFICATION

6.1 CLIENT INDEMNIFICATION. CLIENT SHALL DEFEND, INDEMNIFY, AND HOLD HARMLESS SERVICE PROVIDER AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS FROM AND AGAINST ANY AND ALL THIRD-PARTY CLAIMS, DAMAGES, LOSSES, COSTS, AND EXPENSES (INCLUDING REASONABLE ATTORNEYS' FEES) ARISING OUT OF OR RELATING TO: (A) CLIENT'S USE OF THE SERVICES; (B) CLIENT'S BREACH OF THIS AGREEMENT; (C) CLIENT'S VIOLATION OF APPLICABLE LAW; OR (D) ANY CONTENT OR DATA PROVIDED BY CLIENT.

ARTICLE 7: TERMINATION

7.1 TERMINATION FOR CAUSE. Either party may terminate this Agreement immediately upon written notice if the other party materially breaches any provision of this Agreement and fails to cure such breach within thirty (30) days after receiving written notice thereof.

7.2 TERMINATION FOR CONVENIENCE. Either party may terminate this Agreement for convenience upon ninety (90) days' prior written notice to the other party.

7.3 EFFECT OF TERMINATION. Upon termination of this Agreement, all rights and obligations of the parties shall cease, except that provisions relating to confidentiality, limitation of liability, indemnification, and governing law shall survive such termination.

ARTICLE 8: CONFIDENTIALITY

8.1 CONFIDENTIAL INFORMATION. Each party acknowledges that it may have access to certain confidential information of the other party. Each party agrees to maintain the confidentiality of such information and not to disclose it to any third party without the prior written consent of the disclosing party.

8.2 EXCEPTIONS. The obligations of confidentiality shall not apply to information that: (a) is or becomes publicly available through no breach of this Agreement; (b) is rightfully received from a third party without breach of any confidentiality obligation; (c) is independently developed without use of or reference to the confidential information; or (d) is required to be disclosed by law or court order.

ARTICLE 9: GOVERNING LAW

9.1 This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.

9.2 Any disputes arising out of or relating to this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.`

  // Load file from sessionStorage on component mount
  useEffect(() => {
    const loadFileFromSession = () => {
      try {
        const storedFileData = sessionStorage.getItem('uploadedFileData')
        if (storedFileData) {
          const fileData = JSON.parse(storedFileData)
          
          if (fileData.extractedFromBackend && fileData.content) {
            // Use text content extracted by backend
            setFileContent(fileData.content)
            setFileName(fileData.name || "Document")
            console.log('File loaded from backend extraction:', fileData.name)
            console.log('Content length:', fileData.content.length)
          } else if (fileData.content) {
            // Fallback to locally stored content
            setFileContent(fileData.content)
            setFileName(fileData.name || "Document")
            console.log('File loaded from local storage:', fileData.name)
          } else {
            throw new Error('No text content available')
          }
        } else {
          // No file data found, use mock content
          setFileContent(mockPdfContent)
          setFileName("Sample Service Agreement.pdf")
          setError("No uploaded document found. Displaying sample content.")
        }
      } catch (err) {
        console.error('Error loading file from sessionStorage:', err)
        setFileContent(mockPdfContent)
        setFileName("Sample Service Agreement.pdf")
        setError("Error loading document. Displaying sample content.")
      } finally {
        setIsLoading(false)
      }
    }

    loadFileFromSession()
  }, [])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const callSimplifyAPI = async (clause) => {
    try {
      const response = await fetch('https://legal-doc-backend-686841980348.asia-south1.run.app/api/legal/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clause: clause
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.simplified || "Unable to simplify this clause."
    } catch (error) {
      console.error('Simplify API Error:', error)
      throw error
    }
  }

  const handleSendForSimplification = async () => {
    if (!selectedText.trim()) return

    setIsProcessing(true)

    try {
      console.log('Sending clause for simplification:', selectedText.substring(0, 50) + '...')
      
      const simplifiedText = await callSimplifyAPI(selectedText)
      
      const newNote = {
        id: Date.now().toString(),
        selectedText: selectedText,
        simplifiedText: simplifiedText,
        timestamp: new Date(),
        complexity: selectedText.length > 200 ? "high" : selectedText.length > 100 ? "medium" : "low",
      }

      setNotes((prev) => [newNote, ...prev])
      setSelectedText("")
      console.log('Simplification completed successfully')
    } catch (error) {
      console.error('Error during simplification:', error)
      
      // Fallback to mock response if API fails
      const mockSimplifications = [
        "This clause means that if something goes wrong, the company won't have to pay for certain types of damages like lost profits or business interruption. However, they would still be responsible for direct damages up to the amount of money paid under the contract.",
        "This section limits how much money one party has to pay the other if there's a problem. The maximum amount is equal to what was paid in the past 12 months under this contract.",
        "This part lists the exceptions where the liability limits don't apply. If someone acts with gross negligence, breaks confidentiality rules, doesn't pay what they owe, or violates indemnification duties, then the normal limits don't protect them.",
        "This clause requires the client to protect and compensate the service provider if any third parties sue them because of the client's actions, breach of contract, law violations, or problematic content/data the client provided.",
        "This means either party can end the agreement if the other side seriously breaks the rules and doesn't fix the problem within 30 days of being told about it.",
        "Either party can end this agreement at any time by giving the other party 90 days written notice, even without any specific reason.",
        "When the agreement ends, most obligations stop, but some important rules like keeping secrets, liability limits, and legal jurisdiction continue to apply.",
        "Both parties agree to keep each other's confidential information secret and not share it with anyone else without permission.",
        "This agreement follows Delaware state laws, and any legal disputes must be resolved through arbitration rather than going to court.",
      ]

      const fallbackSimplification = mockSimplifications[Math.floor(Math.random() * mockSimplifications.length)]

      const newNote = {
        id: Date.now().toString(),
        selectedText: selectedText,
        simplifiedText: `${fallbackSimplification} (Note: API connection failed, showing example)`,
        timestamp: new Date(),
        complexity: selectedText.length > 200 ? "high" : selectedText.length > 100 ? "medium" : "low",
        isError: true
      }

      setNotes((prev) => [newNote, ...prev])
      setSelectedText("")
    } finally {
      setIsProcessing(false)
    }
  }

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    })
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const adjustZoom = (delta) => {
    setZoomLevel((prev) => Math.max(50, Math.min(200, prev + delta)))
  }

  const formatDocumentContent = (content) => {
    // Handle different document types and format them properly
    const sections = content.split(/\n\s*\n/).filter(section => section.trim())
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim())
      
      return (
        <div key={index} className="mb-6">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim()
            
            // Check if it's a heading (ARTICLE, section numbers, or all caps)
            const isHeading = /^(ARTICLE|SECTION|\d+\.|[A-Z\s]+:)\s/.test(trimmedLine) || 
                             (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 100)
            
            return (
              <p 
                key={lineIndex} 
                className={`select-text cursor-text hover:bg-blue-50 transition-colors duration-200 p-2 rounded mb-2 ${
                  isHeading ? 'font-bold text-lg mb-4 mt-6' : 'text-justify leading-relaxed'
                }`}
              >
                {trimmedLine || '\u00A0'}
              </p>
            )
          })}
        </div>
      )
    })
  }

  const downloadNote = (note) => {
    const content = `Selected Text:\n${note.selectedText}\n\nSimplified Explanation:\n${note.simplifiedText}\n\nTimestamp: ${note.timestamp.toLocaleString()}`
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `simplified-clause-${note.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const clearAllNotes = () => {
    setNotes([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation showServices={true} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation showServices={true} />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Document Viewer - Left Side */}
        <div className="flex-1 flex flex-col border-r border-border">
          {/* Document Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{fileName}</span>
              {error && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Using sample content</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => adjustZoom(-10)} disabled={zoomLevel <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[4rem] text-center">{zoomLevel}%</span>
              <Button variant="outline" size="sm" onClick={() => adjustZoom(10)} disabled={zoomLevel >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)} title="Reset zoom">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const element = document.createElement('a')
                  const file = new Blob([fileContent], { type: 'text/plain' })
                  element.href = URL.createObjectURL(file)
                  element.download = fileName || 'document.txt'
                  document.body.appendChild(element)
                  element.click()
                  document.body.removeChild(element)
                }}
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900">
            <div
              ref={pdfViewerRef}
              className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            >
              <div className="p-8 font-serif leading-relaxed" onMouseUp={handleTextSelection}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2 text-foreground">
                    {fileName.replace(/\.[^/.]+$/, "").toUpperCase()}
                  </h1>
                  <p className="text-muted-foreground">Legal Document Analysis</p>
                </div>

                <div className="space-y-2 text-sm text-foreground">
                  {formatDocumentContent(fileContent)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="w-96 flex flex-col bg-muted/30">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Clause Simplifier</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select text from the document and click Send to get simplified explanations
            </p>
          </div>

          {/* Text Selection Area */}
          <div className="p-4 border-b border-border">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Selected Text:</label>
              <div className="min-h-[100px] max-h-[120px] p-3 bg-background border border-border rounded-md overflow-y-auto">
                {selectedText ? (
                  <p className="text-sm text-foreground leading-relaxed">{selectedText}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Highlight text in the document to see it here...</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSendForSimplification}
                  disabled={!selectedText.trim() || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Simplify Clause
                    </>
                  )}
                </Button>
                {selectedText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedText("")}
                    title="Clear selection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notes/Simplifications */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Simplified Explanations</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{notes.length}</Badge>
                  {notes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotes}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Clear all notes"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <AnimatePresence>
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        No simplifications yet. 
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Select text from the document and click "Simplify Clause" to get started.
                      </p>
                    </div>
                  ) : (
                    notes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        layout
                      >
                        <Card className={`hover:shadow-md transition-all duration-200 ${
                          note.isError ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800' : ''
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge className={`${getComplexityColor(note.complexity)} text-xs`}>
                                  {note.complexity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {note.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {note.isError && (
                                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-300">
                                    API Error
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(note.simplifiedText)}
                                  className="h-7 w-7 p-0"
                                  title="Copy simplified text"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadNote(note)}
                                  className="h-7 w-7 p-0"
                                  title="Download note"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNote(note.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1">Original Text:</h4>
                              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-h-20 overflow-y-auto">
                                <p className="text-pretty leading-relaxed">
                                  {note.selectedText.length > 200
                                    ? `${note.selectedText.substring(0, 200)}...`
                                    : note.selectedText}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1">Simplified Explanation:</h4>
                              <p className="text-sm text-foreground leading-relaxed">{note.simplifiedText}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}