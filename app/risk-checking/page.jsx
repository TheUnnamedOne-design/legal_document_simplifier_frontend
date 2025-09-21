"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Download, RefreshCw, TrendingUp, TrendingDown, Minus, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function RiskCheckingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [riskData, setRiskData] = useState([])
  const [error, setError] = useState(null)
  const [hasCalledAPI, setHasCalledAPI] = useState(false)

  const parseTextToRisks = (textResponse) => {
    // Check if it's a "no risks" response
    if (textResponse.toLowerCase().includes('no significant risks detected')) {
      return [{
        id: '1',
        title: 'No Significant Risks Detected',
        description: 'The document appears to have standard terms with no major risk factors identified.',
        category: 'assessment',
        severity: 'low',
        likelihood: 'unlikely',
        impact: 'Minimal risk exposure detected in the current document.',
        mitigation: 'Continue with standard review procedures and maintain regular monitoring.',
        expanded: false,
        originalResponse: textResponse
      }]
    }

    const risks = []
    
    // Split by bullet points or asterisks
    const sections = textResponse.split(/\*+/).filter(section => section.trim().length > 20)
    
    sections.forEach((section, index) => {
      const trimmedSection = section.trim()
      if (!trimmedSection) return
      
      // Extract title and description
      const lines = trimmedSection.split('\n').filter(line => line.trim().length > 0)
      if (lines.length === 0) return
      
      // Look for clause patterns
      const clauseMatch = trimmedSection.match(/(.+?):\s*(.+)/s)
      let title, description
      
      if (clauseMatch) {
        title = clauseMatch[1].replace(/^\*+\s*/, '').replace(/\*+$/, '').trim()
        description = clauseMatch[2].replace(/\*\*/g, '').trim()
      } else {
        // Fallback: use first sentence as title, rest as description
        const sentences = trimmedSection.split('.')
        title = sentences[0].replace(/^\*+\s*/, '').trim() || `Risk Item ${index + 1}`
        description = sentences.slice(1).join('.').replace(/\*\*/g, '').trim()
      }
      
      // Clean up title
      title = title.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim()
      
      // Determine severity based on keywords
      let severity = 'medium'
      const lowerText = trimmedSection.toLowerCase()
      if (lowerText.includes('excessive') || lowerText.includes('significant') || 
          lowerText.includes('major') || lowerText.includes('critical') ||
          lowerText.includes('disputes') || lowerText.includes('penalty')) {
        severity = 'high'
      } else if (lowerText.includes('minor') || lowerText.includes('consider')) {
        severity = 'medium'
      } else if (lowerText.includes('vague') || lowerText.includes('unclear') || 
                 lowerText.includes('ambiguous')) {
        severity = 'medium'
      }
      
      // Determine category
      let category = 'contractual'
      if (lowerText.includes('deposit') || lowerText.includes('cost') || 
          lowerText.includes('rent') || lowerText.includes('payment') || 
          lowerText.includes('fee')) {
        category = 'financial'
      } else if (lowerText.includes('legal') || lowerText.includes('law') || 
                 lowerText.includes('liability')) {
        category = 'legal'
      } else if (lowerText.includes('registration') || lowerText.includes('compliance') ||
                 lowerText.includes('regulation')) {
        category = 'compliance'
      } else if (lowerText.includes('eviction') || lowerText.includes('termination')) {
        category = 'operational'
      }
      
      // Determine likelihood
      let likelihood = 'possible'
      if (lowerText.includes('could lead to') || lowerText.includes('may result in')) {
        likelihood = 'likely'
      } else if (lowerText.includes('significant') || lowerText.includes('disputes')) {
        likelihood = 'very-likely'
      }
      
      if (title && description && description.length > 10) {
        risks.push({
          id: String(index + 1),
          title: title,
          description: description,
          category: category,
          severity: severity,
          likelihood: likelihood,
          impact: `Risk related to ${title.toLowerCase()}. ${description.substring(0, 100)}...`,
          mitigation: 'Review the specific clause terms and consider legal consultation for clarification and potential negotiation.',
          expanded: false,
          originalResponse: textResponse
        })
      }
    })
    
    return risks.length > 0 ? risks : mockRiskData
  }

  const mockRiskData = [
    {
      id: "1",
      title: "Unlimited Liability Exposure",
      description:
        "The contract contains broad indemnification clauses that could expose the company to unlimited financial liability for third-party claims, including those arising from the service provider's negligence.",
      category: "legal",
      severity: "critical",
      likelihood: "likely",
      impact: "Potential financial losses exceeding $1M in case of major incidents or data breaches.",
      mitigation:
        "Negotiate liability caps, exclude gross negligence from indemnification, and require adequate insurance coverage from the service provider.",
      expanded: false,
    },
    {
      id: "2",
      title: "Inadequate Data Protection Clauses",
      description:
        "The agreement lacks comprehensive data protection and privacy provisions, potentially violating GDPR, CCPA, and other regulatory requirements.",
      category: "compliance",
      severity: "high",
      likelihood: "very-likely",
      impact: "Regulatory fines up to 4% of annual revenue, reputational damage, and potential lawsuits.",
      mitigation:
        "Add detailed data processing agreements, specify security standards, and include breach notification procedures.",
      expanded: false,
    },
    {
      id: "3",
      title: "Weak Termination Rights",
      description:
        "The contract provides limited termination rights for the client, with lengthy notice periods and potential penalties that could lock the company into an unfavorable arrangement.",
      category: "contractual",
      severity: "medium",
      likelihood: "possible",
      impact: "Inability to exit underperforming relationships, continued costs for unsatisfactory services.",
      mitigation:
        "Negotiate termination for convenience clauses, reduce notice periods, and eliminate or cap termination penalties.",
      expanded: false,
    },
    {
      id: "4",
      title: "Intellectual Property Ambiguity",
      description:
        "Unclear ownership of work product and intellectual property created during the engagement could lead to disputes and loss of valuable assets.",
      category: "legal",
      severity: "high",
      likelihood: "likely",
      impact: "Loss of proprietary technology, competitive disadvantage, and potential litigation costs.",
      mitigation: "Clearly define IP ownership, specify work-for-hire arrangements, and include assignment provisions.",
      expanded: false,
    },
    {
      id: "5",
      title: "Payment Terms Risk",
      description:
        "Advance payment requirements and limited refund provisions create cash flow risks and potential losses if services are not delivered as expected.",
      category: "financial",
      severity: "medium",
      likelihood: "possible",
      impact: "Cash flow constraints and potential loss of advance payments up to $50,000.",
      mitigation: "Negotiate milestone-based payments, escrow arrangements, or performance guarantees.",
      expanded: false,
    },
    {
      id: "6",
      title: "Service Level Agreement Gaps",
      description:
        "Absence of specific performance metrics and service level agreements could result in substandard service delivery without recourse.",
      category: "operational",
      severity: "medium",
      likelihood: "likely",
      impact: "Operational disruptions, missed deadlines, and inability to enforce performance standards.",
      mitigation: "Define specific SLAs, include performance metrics, and establish remedies for non-compliance.",
      expanded: false,
    },
  ]

  const callRiskAPI = async () => {
    try {
      // Check if we have uploaded file data
      if (window.uploadedFileData && window.uploadedFileData.doc_id) {
        const response = await fetch('http://127.0.0.1:5000/api/legal/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'Analyze all potential risks in the document',
            doc_id: window.uploadedFileData.doc_id,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Risk API Response:', data)
        
        // Parse the API response and convert to our format
        if (data.risks || data.result || data.answer) {
          const apiResponse = data.risks || data.result || data.answer
          
          // If API returns structured data, use it
          if (typeof apiResponse === 'object' && Array.isArray(apiResponse)) {
            return apiResponse.map(risk => ({
              ...risk,
              expanded: false
            }))
          } 
          // If API returns text, parse it to structured format
          else if (typeof apiResponse === 'string' && apiResponse.trim()) {
            console.log('Parsing text response from API')
            const parsedRisks = parseTextToRisks(apiResponse)
            
            return parsedRisks
          } else {
            console.log('Using mock data, API Response:', apiResponse)
            return mockRiskData
          }
        }
        
        return mockRiskData
      } else {
        console.log('No file data found, using mock data')
        return mockRiskData
      }
    } catch (error) {
      console.error('Risk API Error:', error)
      setError(`API connection failed: ${error.message}. Using demo data.`)
      return mockRiskData
    }
  }

  useEffect(() => {
    const loadRiskData = async () => {
      // Prevent duplicate API calls
      if (hasCalledAPI) {
        console.log('Risk API already called, skipping...')
        return
      }
      
      setIsLoading(true)
      setError(null)
      setHasCalledAPI(true)
      
      try {
        console.log('Starting risk analysis API call...')
        const risks = await callRiskAPI()
        setRiskData(risks)
        console.log('Risk analysis completed successfully')
      } catch (error) {
        console.error('Error loading risk data:', error)
        setError('Failed to load risk analysis')
        setRiskData(mockRiskData)
      } finally {
        setIsLoading(false)
      }
    }

    loadRiskData()
  }, []) // Empty dependency array to run only once

  const toggleExpanded = (id) => {
    setRiskData((prev) => prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)))
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800"
    }
  }

  const getLikelihoodIcon = (likelihood) => {
    switch (likelihood) {
      case "very-likely":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "likely":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case "possible":
        return <Minus className="h-4 w-4 text-yellow-500" />
      case "unlikely":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const riskStats = {
    total: riskData.length,
    critical: riskData.filter((item) => item.severity === "critical").length,
    high: riskData.filter((item) => item.severity === "high").length,
    medium: riskData.filter((item) => item.severity === "medium").length,
    low: riskData.filter((item) => item.severity === "low").length,
  }

  const regenerateAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    setHasCalledAPI(false) // Reset flag to allow re-analysis
    
    try {
      console.log('Regenerating risk analysis...')
      const risks = await callRiskAPI()
      setRiskData(risks)
      setHasCalledAPI(true) // Set flag after successful call
      console.log('Risk analysis regenerated successfully')
    } catch (error) {
      console.error('Error regenerating analysis:', error)
      setError('Failed to regenerate analysis')
      setHasCalledAPI(true) // Set flag even on error to prevent loops
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
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Risk Assessment</h1>
                <p className="text-muted-foreground">Comprehensive risk analysis of your legal documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={regenerateAnalysis} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Re-analyze
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
              <p className="text-muted-foreground">Analyzing risks in your documents...</p>
              <p className="text-sm text-muted-foreground mt-2">Evaluating potential legal and financial exposures</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
                    <div className="text-sm text-muted-foreground">Critical</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{riskStats.high}</div>
                    <div className="text-sm text-muted-foreground">High</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{riskStats.medium + riskStats.low}</div>
                    <div className="text-sm text-muted-foreground">Medium & Low</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {riskData.map((risk, index) => (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      layout
                    >
                      <Card
                        className={`h-full hover:shadow-lg transition-all duration-300 border-l-4 ${getSeverityColor(risk.severity)}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-semibold text-foreground pr-4">{risk.title}</CardTitle>
                            <div className="flex items-center space-x-2">
                              {getLikelihoodIcon(risk.likelihood)}
                              <Badge className={`${getSeverityColor(risk.severity)} text-xs font-medium border`}>
                                {risk.severity}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span className="capitalize">{risk.category}</span>
                            <span>•</span>
                            <span className="capitalize">{risk.likelihood?.replace("-", " ")}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Description</h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="text-muted-foreground text-sm leading-relaxed">{risk.description}</p>
                            </div>
                          </div>

                          <AnimatePresence>
                            {risk.expanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                {risk.impact && (
                                  <div>
                                    <h4 className="font-medium text-foreground mb-2">Potential Impact</h4>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <p className="text-muted-foreground text-sm leading-relaxed">{risk.impact}</p>
                                    </div>
                                  </div>
                                )}

                                {risk.mitigation && (
                                  <div>
                                    <h4 className="font-medium text-foreground mb-2">Recommended Mitigation</h4>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <p className="text-muted-foreground text-sm leading-relaxed">{risk.mitigation}</p>
                                    </div>
                                  </div>
                                )}

                                {risk.originalResponse && (
                                  <div>
                                    <h4 className="font-medium text-foreground mb-2">Full Analysis Report</h4>
                                    <div className="bg-muted/30 p-3 rounded-lg border">
                                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                        {risk.originalResponse}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(risk.id)}
                              className="p-0 h-auto text-primary hover:text-primary/80"
                            >
                              {risk.expanded ? "Show Less" : "Show Details"}
                            </Button>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(`${risk.title}\n\n${risk.description}${risk.impact ? '\n\nImpact: ' + risk.impact : ''}${risk.mitigation ? '\n\nMitigation: ' + risk.mitigation : ''}${risk.originalResponse ? '\n\nOriginal Analysis:\n' + risk.originalResponse : ''}`)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Copy risk details"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const content = `${risk.title}\n\n${risk.description}${risk.impact ? '\n\nImpact: ' + risk.impact : ''}${risk.mitigation ? '\n\nMitigation: ' + risk.mitigation : ''}${risk.originalResponse ? '\n\nOriginal Analysis:\n' + risk.originalResponse : ''}`
                                  const element = document.createElement('a')
                                  const file = new Blob([content], { type: 'text/plain' })
                                  element.href = URL.createObjectURL(file)
                                  element.download = `risk-${risk.id}-${new Date().toISOString().split('T')[0]}.txt`
                                  document.body.appendChild(element)
                                  element.click()
                                  document.body.removeChild(element)
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Download risk report"
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

              {riskData.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No risks identified in the analysis.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try re-running the analysis or check if the document was uploaded correctly.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}