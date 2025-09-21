"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, RefreshCw, ChevronDown, ChevronUp, Copy, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function SummarisationPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [summaryData, setSummaryData] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [error, setError] = useState(null)
  const [apiSummary, setApiSummary] = useState("")

  const mockSummaryData = [
    {
      id: "1",
      title: "Contract Overview",
      category: "overview",
      content:
        "This is a comprehensive service agreement between TechCorp Inc. and Legal Solutions LLC for the provision of legal consulting services. The contract establishes a 12-month engagement period with automatic renewal clauses and defines the scope of work including contract review, compliance consulting, and legal advisory services.",
      priority: "high",
      expanded: false,
    },
    {
      id: "2",
      title: "Payment Terms & Schedule",
      category: "key-terms",
      content:
        "Monthly retainer fee of $15,000 due on the 1st of each month. Additional hourly work billed at $450/hour for partners and $275/hour for associates. Payment terms are Net 30 with 1.5% monthly late fees. All expenses above $500 require pre-approval.",
      priority: "high",
      expanded: false,
    },
    {
      id: "3",
      title: "Termination Provisions",
      category: "key-terms",
      content:
        "Either party may terminate with 60 days written notice. Immediate termination allowed for material breach, non-payment exceeding 45 days, or insolvency. Upon termination, all work product must be delivered within 10 business days.",
      priority: "medium",
      expanded: false,
    },
    {
      id: "4",
      title: "Client Obligations",
      category: "obligations",
      content:
        "Client must provide timely access to relevant documents, personnel, and systems. Client responsible for implementation of recommendations and maintaining confidentiality of legal advice. Monthly status meetings required.",
      priority: "medium",
      expanded: false,
    },
    {
      id: "5",
      title: "Service Provider Obligations",
      category: "obligations",
      content:
        "Provider must maintain professional liability insurance of $2M minimum. All work performed by licensed attorneys. Response time of 24 hours for urgent matters, 72 hours for routine matters. Monthly reporting required.",
      priority: "medium",
      expanded: false,
    },
    {
      id: "6",
      title: "Liability Limitations",
      category: "risks",
      content:
        "Provider's liability limited to fees paid in the 12 months preceding the claim, capped at $500,000. Excludes gross negligence and willful misconduct. No liability for consequential or punitive damages. Client must provide notice of claims within 6 months.",
      priority: "high",
      expanded: false,
    },
    {
      id: "7",
      title: "Key Dates & Deadlines",
      category: "dates",
      content:
        "Contract effective January 1, 2024. Initial term expires December 31, 2024. Auto-renewal for successive 12-month periods unless terminated. First payment due January 1, 2024. Annual review scheduled for October 2024.",
      priority: "low",
      expanded: false,
    },
  ]

  const callSummaryAPI = async () => {
    try {
      const formData = new FormData()
      
      // Check if we have uploaded file data from upload page
      if (window.uploadedFileData && window.uploadedFileData.file) {
        formData.append('file', window.uploadedFileData.file)
        console.log('Using uploaded file for summary:', window.uploadedFileData.name)
      } else {
        // Fallback to text-based request
        formData.append('text', 'Summarize the uploaded legal document with key sections and important terms')
        console.log('No file found, using text fallback for summary')
      }

      const response = await fetch('http://127.0.0.1:5000/api/legal/summarise_document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Parse the API response - backend returns a dictionary with section headings
      if (data.Summary || data.result || data.message) {
        const apiResponse = data.Summary || data.result || data.message
        
        // If API returns a dictionary object (which it does from the backend)
        if (typeof apiResponse === 'object' && apiResponse !== null && !Array.isArray(apiResponse)) {
          console.log('API Summary Response (Object):', apiResponse)
          
          // Convert the dictionary to our summary format
          const convertedSummary = Object.entries(apiResponse).map(([title, content], index) => ({
            id: `api-${index + 1}`,
            title: title,
            category: getCategoryFromTitle(title),
            content: content,
            priority: getPriorityFromContent(content),
            expanded: false,
          }))
          
          // Set the raw API response for the blue summary card
          setApiSummary(Object.entries(apiResponse).map(([title, content]) => 
            `${title}:\n${content}`
          ).join('\n\n'))
          
          return convertedSummary
        } else if (typeof apiResponse === 'string') {
          // Handle string response
          console.log('API Summary Response (String):', apiResponse)
          setApiSummary(apiResponse)
          return mockSummaryData.map(item => 
            item.id === "1" ? {...item, content: apiResponse} : item
          )
        }
        
        return mockSummaryData
      }
      
      return mockSummaryData
    } catch (error) {
      console.error('Summary API Error:', error)
      setError(`API connection failed: ${error.message}. Using demo data.`)
      return mockSummaryData
    }
  }

  // Helper function to categorize sections based on title
  const getCategoryFromTitle = (title) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('overview') || titleLower.includes('introduction') || titleLower.includes('preamble')) {
      return 'overview'
    }
    if (titleLower.includes('payment') || titleLower.includes('fee') || titleLower.includes('termination') || titleLower.includes('term')) {
      return 'key-terms'
    }
    if (titleLower.includes('obligation') || titleLower.includes('duty') || titleLower.includes('responsibility')) {
      return 'obligations'
    }
    if (titleLower.includes('risk') || titleLower.includes('liability') || titleLower.includes('penalty')) {
      return 'risks'
    }
    if (titleLower.includes('date') || titleLower.includes('deadline') || titleLower.includes('time') || titleLower.includes('schedule')) {
      return 'dates'
    }
    return 'overview' // default category
  }

  // Helper function to determine priority based on content
  const getPriorityFromContent = (content) => {
    const contentLower = content.toLowerCase()
    if (contentLower.includes('penalty') || contentLower.includes('liability') || contentLower.includes('termination') || contentLower.includes('payment')) {
      return 'high'
    }
    if (contentLower.includes('obligation') || contentLower.includes('requirement') || contentLower.includes('must')) {
      return 'medium'
    }
    return 'low'
  }

  useEffect(() => {
    const loadSummaryData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const summary = await callSummaryAPI()
        setSummaryData(summary)
      } catch (error) {
        console.error('Error loading summary data:', error)
        setError('Failed to load document summary')
        setSummaryData(mockSummaryData)
      } finally {
        setIsLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  const toggleExpanded = (id) => {
    setSummaryData((prev) => prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)))
  }

  const filteredData =
    selectedCategory === "all" ? summaryData : summaryData.filter((item) => item.category === selectedCategory)

  const categories = [
    { value: "all", label: "All Sections", count: summaryData.length },
    { value: "overview", label: "Overview", count: summaryData.filter((item) => item.category === "overview").length },
    {
      value: "key-terms",
      label: "Key Terms",
      count: summaryData.filter((item) => item.category === "key-terms").length,
    },
    {
      value: "obligations",
      label: "Obligations",
      count: summaryData.filter((item) => item.category === "obligations").length,
    },
    { value: "risks", label: "Risks", count: summaryData.filter((item) => item.category === "risks").length },
    { value: "dates", label: "Important Dates", count: summaryData.filter((item) => item.category === "dates").length },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
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

  const regenerateSummary = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const summary = await callSummaryAPI()
      setSummaryData(summary)
    } catch (error) {
      console.error('Error regenerating summary:', error)
      setError('Failed to regenerate summary')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation showServices={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Document Summary</h1>
                <p className="text-muted-foreground">AI-generated analysis of your legal documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={regenerateSummary} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                <CardContent className="p-4">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">{error}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Analyzing your documents...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{summaryData.length}</div>
                    <div className="text-sm text-muted-foreground">Sections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {summaryData.filter((item) => item.priority === "high").length}
                    </div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </CardContent>
                </Card>
              </div>

              {/* API Summary Display */}
              {apiSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center space-x-2">
                          <FileText className="h-5 w-5" />
                          <span>AI Summary</span>
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(apiSummary)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Copy summary"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const element = document.createElement('a')
                              const file = new Blob([apiSummary], { type: 'text/plain' })
                              element.href = URL.createObjectURL(file)
                              element.download = `document-summary-${new Date().toISOString().split('T')[0]}.txt`
                              document.body.appendChild(element)
                              element.click()
                              document.body.removeChild(element)
                            }}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Download summary"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-blue-700 dark:text-blue-300 leading-relaxed whitespace-pre-wrap">{apiSummary}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="h-9"
                    >
                      {category.label}
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {filteredData.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      layout
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-semibold text-foreground pr-4">
                              {section.title}
                            </CardTitle>
                            <Badge className={`${getPriorityColor(section.priority)} text-xs font-medium`}>
                              {section.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <motion.div
                            initial={false}
                            animate={{ height: section.expanded ? "auto" : "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p
                                className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${
                                  !section.expanded ? "line-clamp-3" : ""
                                }`}
                              >
                                {section.content}
                              </p>
                            </div>
                          </motion.div>
                          <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(section.id)}
                              className="p-0 h-auto text-primary hover:text-primary/80"
                            >
                              {section.expanded ? (
                                <>
                                  Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                </>
                              ) : (
                                <>
                                  Show More <ChevronDown className="h-4 w-4 ml-1" />
                                </>
                              )}
                            </Button>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(`${section.title}\n\n${section.content}`)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Copy section"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const content = `${section.title}\n\n${section.content}`
                                  const element = document.createElement('a')
                                  const file = new Blob([content], { type: 'text/plain' })
                                  element.href = URL.createObjectURL(file)
                                  element.download = `${section.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
                                  document.body.appendChild(element)
                                  element.click()
                                  document.body.removeChild(element)
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Download section"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sections found for the selected category.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}