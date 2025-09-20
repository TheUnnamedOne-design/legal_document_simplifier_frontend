import React from 'react';
import { CheckCircle, AlertCircle, Info, FileText, Copy, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultBox = ({ result, onClear }) => {
  if (!result) return null;

  const getActionInfo = (action) => {
    switch (action) {
      case 'ingest':
        return {
          title: 'Document Ingestion Complete',
          icon: CheckCircle,
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'query':
        return {
          title: 'Query Results',
          icon: Info,
          color: 'blue',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'summary':
        return {
          title: 'Document Summary',
          icon: FileText,
          color: 'purple',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'risk':
        return {
          title: 'Risk Analysis Report',
          icon: AlertCircle,
          color: 'orange',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600 dark:text-orange-400'
        };
      default:
        return {
          title: 'Analysis Complete',
          icon: Info,
          color: 'gray',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const actionInfo = getActionInfo(result.action);
  const Icon = actionInfo.icon;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.data);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadResult = () => {
    const element = document.createElement('a');
    const file = new Blob([result.data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${result.action}-result-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="w-full mt-8"
      >
        <div className={`${actionInfo.bgColor} rounded-xl border ${actionInfo.borderColor} shadow-lg overflow-hidden`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                  <Icon className={`w-6 h-6 ${actionInfo.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {actionInfo.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.timestamp.toLocaleString()}
                    </p>
                    {result.query && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                        Query: "{result.query.length > 30 ? result.query.substring(0, 30) + '...' : result.query}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={downloadResult}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Download result"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={onClear}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Clear result"
                >
                  ×
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              {result.status === 'error' ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.data}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {result.data}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultBox;