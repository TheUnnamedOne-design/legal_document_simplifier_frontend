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

  const storeFileInSession = (fileName, textContent, docId, fileSize, fileType) => {
    try {
      const fileData = {
        name: fileName,
        size: fileSize,
        type: fileType,
        content: textContent, // Text content from backend
        doc_id: docId,
        uploadTime: new Date().toISOString(),
        extractedFromBackend: true // Flag to indicate content came from backend
      }
      
      sessionStorage.setItem('uploadedFileData', JSON.stringify(fileData))
      console.log('File data stored in sessionStorage:', fileName)
      console.log('Text content length:', textContent.length)
    } catch (error) {
      console.error('Error storing file in sessionStorage:', error)
    }
  }

  const performAutoIngest = async (file) => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('doc_id', 'ef22gge2')

      console.log('Uploading file to backend for text extraction...')

      const response = await fetch('https://legal-doc-backend-686841980348.asia-south1.run.app/api/legal/ingest', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Auto-ingest successful:', data.message)
      console.log('Extracted text length:', data.text_content?.length || 0)
      
      // Store the extracted text content in sessionStorage
      if (data.text_content) {
        storeFileInSession(
          data.filename || file.name,
          data.text_content,
          data.doc_id,
          file.size,
          file.type
        )
      } else {
        throw new Error('No text content extracted from document')
      }
      
      // Also store in window object for backward compatibility
      window.uploadedFileData = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        doc_id: data.doc_id,
        text_content: data.text_content
      }
      
      setProcessComplete(true)
      setIsProcessing(false)
    } catch (err) {
      console.error('Auto-ingest error:', err)
      setError(`Processing failed: ${err.message}. Document upload completed but text extraction may have failed.`)
      setIsProcessing(false)
      
      // For fallback, try to read file locally (for text files only)
      if (file.type.startsWith('text/')) {
        try {
          const fallbackContent = await file.text()
          storeFileInSession(
            file.name,
            fallbackContent,
            'ef22gge2',
            file.size,
            file.type
          )
          console.log('Used fallback local text extraction')
        } catch (fallbackErr) {
          console.error('Fallback text extraction failed:', fallbackErr)
        }
      }
      
      // Still allow user to proceed
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

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.")
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
          const newProgress = Math.min(prev.uploadProgress + Math.random() * 25 + 5, 100)
          const newStatus = newProgress === 100 ? "completed" : "uploading"

          if (newProgress === 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsUploading(false)
              setUploadComplete(true)
              
              console.log('Starting auto-ingest and text extraction for file:', file.name)
              performAutoIngest(file)
            }, 500)
          }

          return { ...prev, uploadProgress: newProgress, status: newStatus }
        }
        return prev
      })
    }, 300)
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
                    Extracting text content and analyzing your document...
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    This may take a moment for PDF files
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
                      : "Your document has been successfully processed with text extracted and is ready for analysis."
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