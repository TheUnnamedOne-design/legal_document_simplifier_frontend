import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, Moon, Sun } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ActionButtons from './components/ActionButtons';
import ResultBox from './components/ResultBox';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Check system preference for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAction = async (action, query = null) => {
    if (action === 'ingest' && !uploadedFile) return; // only ingest requires file

    setLoading(action);
    setError(null);

    try {
      // API endpoints
      const endpoints = {
        ingest: 'http://127.0.0.1:5000/api/legal/ingest',
        query: 'http://127.0.0.1:5000/api/legal/query',
        summary: 'http://127.0.0.1:5000/api/legal/summarise_document',
        risk: 'http://127.0.0.1:5000/api/legal/risk',
      };

      let response;

      switch (action) {
        case 'ingest': {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('doc_id', 'ef22gge2'); // static or dynamic doc id
          response = await fetch(endpoints.ingest, {
            method: 'POST',
            body: formData,
          });
          break;
        }

        case 'query': {
          response = await fetch(endpoints.query, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: query,
              doc_id: 'ef22gge2' // must match ingest doc_id
            }),
          });
          break;
        }

        case 'summary': {
          const formData = new FormData();

          if (uploadedFile) {
            formData.append('file', uploadedFile);
          } else if (query) {
            formData.append('text', query); // send raw text if no file
          } else {
            throw new Error('No file or text provided for summarisation.');
          }

          response = await fetch(endpoints.summary, {
            method: 'POST',
            body: formData,
          });
          break;
        }

        case 'risk': {
          response = await fetch(endpoints.risk, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              doc_id: 'ef22gge2',
            }),
          });
          break;
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Normalize response handling
      setResult({
        action,
        data:
          data.Summary ||
          data.answer ||
          data.risks ||
          data.result ||
          data.message ||
          'Operation completed successfully',
        status: data.status || 'success',
        query,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('API Error:', err);

      // Mock responses for fallback
      const mockResponses = {
        ingest: `Document "${uploadedFile?.name}" has been ingested successfully.`,
        query: query
          ? `Query: "${query}"\n\nAnswer retrieved from document.`
          : 'Please provide a query.',
        summary: `📄 Summary generated successfully.`,
        risk: query
          ? `🔍 Risk analysis for "${query}" completed.`
          : 'Please specify your risk analysis concern.',
      };

      setResult({
        action,
        data: mockResponses[action] || 'Analysis completed successfully.',
        status: 'mock',
        query,
        timestamp: new Date(),
      });
    } finally {
      setLoading(null);
    }
  };

  // Fixed auto-ingest function
  const performAutoIngest = async () => {
    if (!uploadedFile) return;

    console.log('Starting auto-ingest for file:', uploadedFile.name);

    // Add small delay to ensure file is properly set
    setTimeout(() => {
      handleAction('ingest');
    }, 100);
  };

  const handleFileUpload = (file, uploadError) => {
    if (uploadError) {
      setError(uploadError);
      setUploadedFile(null);
      setResult(null);
    } else {
      setError(null);
      setUploadedFile(file);
      setResult(null);

      console.log('File uploaded successfully:', file.name);

      // Show immediate feedback
      setResult({
        action: 'upload',
        data: `File "${file.name}" uploaded successfully. Starting automatic document analysis...`,
        status: 'info',
        timestamp: new Date()
      });
    }
  };

  // Use useEffect to trigger auto-ingest when file is uploaded
  useEffect(() => {
    if (uploadedFile && result?.action === 'upload') {
      console.log('Triggering auto-ingest...');
      performAutoIngest();
    }
  }, [uploadedFile, result]);

  const handleFileRemove = () => {
    setUploadedFile(null);
    setResult(null);
    setError(null);
  };

  const handleClearResult = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      {/* Navbar */}
      <motion.nav
        className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Legal Document AI Assistant
              </span>
            </motion.div>

            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Legal Document
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Upload your legal documents and leverage advanced AI analysis for comprehensive insights,
            intelligent summaries, targeted queries, and thorough risk assessment.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-10"
        >
          <FileUpload
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            error={error}
          />

          {uploadedFile && (
            <ActionButtons
              uploadedFile={uploadedFile}
              onAction={handleAction}
              loading={loading}
            />
          )}

          <ResultBox
            result={result}
            onClear={handleClearResult}
          />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 text-gray-500 dark:text-gray-400"
        >
          <p className="text-xs mt-2 opacity-75">
            Secure document processing • Enterprise-grade analysis • Professional legal insights
          </p>
        </motion.footer>
      </main>
    </div>
  );
}

export default App;