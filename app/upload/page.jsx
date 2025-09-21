"use client"
import { useState, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processComplete, setProcessComplete] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleChange = useCallback((e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [])

  const storeFileInSession = async (file) => {
  try {
    let fileContent
    
    if (file.type === 'application/pdf') {
      // For PDFs, store as base64 and let the display component handle text extraction
      const reader = new FileReader()
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            content: reader.result, // Base64 content
            rawContent: true, // Flag to indicate this needs processing
            doc_id: 'ef22gge2',
            lastModified: file.lastModified,
            uploadTime: new Date().toISOString()
          }
          
          sessionStorage.setItem('uploadedFileData', JSON.stringify(fileData))
          console.log('PDF file stored in sessionStorage:', fileData.name)
          resolve()
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } else {
      // For text files, read as text
      fileContent = await file.text()
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: fileContent,
        doc_id: 'ef22gge2',
        lastModified: file.lastModified,
        uploadTime: new Date().toISOString()
      }
      
      sessionStorage.setItem('uploadedFileData', JSON.stringify(fileData))
      console.log('Text file stored in sessionStorage:', fileData.name)
    }
  } catch (error) {
    console.error('Error storing file in sessionStorage:', error)
  }
}

  const performAutoIngest = async (file) => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      // Store file in sessionStorage first
      await storeFileInSession(file)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('doc_id', 'ef22gge2')

      const response = await fetch('http://127.0.0.1:5000/api/legal/ingest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Auto-ingest successful:', data)
      
      // Also store in window object for backward compatibility
      window.uploadedFileData = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        doc_id: 'ef22gge2'
      }
      
      setProcessComplete(true)
      setIsProcessing(false)
    } catch (err) {
      console.error('Auto-ingest error:', err)
      setError(`Processing failed: ${err.message}`)
      setIsProcessing(false)
      
      // Still store file data for demo purposes
      await storeFileInSession(file)
      window.uploadedFileData = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        doc_id: 'ef22gge2'
      }
      
      setProcessComplete(true)
    }
  }

  const handleFiles = (files) => {
    const file = files[0] // Only take the first file
    const validFile = file.type === "application/pdf" || 
                     file.type.startsWith("text/") ||
                     file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                     file.type === "application/msword"

    if (!validFile) {
      alert("Please upload PDF, TXT, DOC, or DOCX files only.")
      return
    }

    // Reset all states
    setError(null)
    setProcessComplete(false)
    setIsProcessing(false)
    
    setIsUploading(true)
    const newFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
      status: "uploading",
      file: file
    }

    setUploadedFile(newFile)

    // Simulate file upload with progress
    const interval = setInterval(() => {
      setUploadedFile((prev) => {
        if (prev && prev.uploadProgress < 100) {
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 30, 100)
          const newStatus = newProgress === 100 ? "completed" : "uploading"

          if (newProgress === 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsUploading(false)
              setUploadComplete(true)
              
              console.log('Starting auto-ingest for file:', file.name)
              performAutoIngest(file)
            }, 500)
          }

          return { ...prev, uploadProgress: newProgress, status: newStatus }
        }
        return prev
      })
    }, 200)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadComplete(false)
    setProcessComplete(false)
    setIsProcessing(false)
    setError(null)
    
    // Clear sessionStorage
    sessionStorage.removeItem('uploadedFileData')
    if (window.uploadedFileData) {
      delete window.uploadedFileData
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation showServices={processComplete} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Upload Your Document</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your legal document to begin analysis. We support PDF, TXT, DOC, and DOCX files.
          </p>
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
              <Card className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card
            className={`relative border-2 border-dashed transition-all duration-300 ${
              dragActive
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <CardContent className="p-12">
              <div
                className="text-center"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Drag and drop your file here</h3>
                <p className="text-muted-foreground mb-6">or click to browse and select a file</p>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild className="cursor-pointer">
                    <span>Choose File</span>
                  </Button>
                </label>
                <p className="text-sm text-muted-foreground mt-4">
                  Supported formats: PDF, TXT, DOC, DOCX (Max 10MB per file)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uploaded File */}
        <AnimatePresence>
          {uploadedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-8"
            >
              <h3 className="text-lg font-semibold text-foreground">Uploaded File</h3>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {uploadedFile.status === "uploading" && (
                          <div className="w-24">
                            <Progress value={uploadedFile.uploadProgress} className="h-2" />
                          </div>
                        )}
                        {uploadedFile.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {uploadedFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                        <Button variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing State */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Processing Document</h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Your document is being analyzed and prepared for legal services...
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message and Next Steps */}
        <AnimatePresence>
          {processComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                    {error ? "Upload Complete!" : "Processing Complete!"}
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    {error 
                      ? "Your document has been uploaded. Some processing errors occurred, but you can still use the services."
                      : "Your document has been successfully processed and is ready for analysis."
                    }
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        console.log('Navigating to Simplify Clause...')
                        router.push("/simplify-clause")
                      }}
                    >
                      Simplify Clause
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        console.log('Navigating to Summarisation...')
                        router.push("/summarisation")
                      }}
                    >
                      Summarisation
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent" 
                      onClick={() => {
                        console.log('Navigating to Query...')
                        router.push("/query")
                      }}
                    >
                      Query
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => {
                        console.log('Navigating to Risk Checking...')
                        router.push("/risk-checking")
                      }}
                    >
                      Risk Checking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isUploading && !uploadComplete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="inline-flex items-center space-x-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Uploading your document...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}