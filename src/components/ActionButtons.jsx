import React, { useState } from 'react';
import { Database, Search, FileText, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActionButtons = ({ uploadedFile, onAction, loading }) => {
  const [expandedAction, setExpandedAction] = useState(null);
  const [inputValues, setInputValues] = useState({
    query: '',
    risk: ''
  });

  const buttons = [
    {
      id: 'query',
      label: 'Query',
      description: 'Ask questions about the document',
      icon: Search,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      requiresInput: true,
      placeholder: 'What are the key terms and conditions?'
    },
    {
      id: 'summary',
      label: 'Summary',
      description: 'Get key points and overview',
      icon: FileText,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      requiresInput: false
    },
    {
      id: 'risk',
      label: 'Risk Analysis',
      description: 'Identify potential legal risks',
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      placeholder: 'What are the liability concerns in this contract?'
    }
  ];

  const handleButtonClick = (button) => {
    if (!uploadedFile) return;

    if (button.requiresInput) {
      setExpandedAction(expandedAction === button.id ? null : button.id);
    } else {
      onAction(button.id, null);
    }
  };

  const handleInputSubmit = (actionId) => {
    const inputValue = inputValues[actionId];
    if (!inputValue.trim()) return;

    onAction(actionId, inputValue);
    setExpandedAction(null);
    setInputValues(prev => ({ ...prev, [actionId]: '' }));
  };

  const handleInputChange = (actionId, value) => {
    setInputValues(prev => ({ ...prev, [actionId]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        AI Analysis Options
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          const isLoading = loading === button.id;
          const isExpanded = expandedAction === button.id;
          const isDisabled = !uploadedFile || (loading && loading !== button.id);
          
          return (
            <motion.div
              key={button.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="space-y-3"
            >
              <motion.button
                onClick={() => handleButtonClick(button)}
                disabled={isDisabled}
                className={`
                  relative group w-full p-6 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden
                  ${isDisabled
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed' 
                    : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-${button.color}-300 hover:shadow-lg hover:shadow-${button.color}-500/10 ${isExpanded ? `border-${button.color}-300 shadow-lg` : ''}`
                  }
                `}
                whileHover={isDisabled ? {} : { scale: 1.02, y: -2 }}
                whileTap={isDisabled ? {} : { scale: 0.98 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-3 rounded-lg bg-gradient-to-br ${button.gradient} 
                        ${isLoading ? 'animate-pulse' : ''}
                      `}>
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {button.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isLoading ? 'Processing...' : button.description}
                        </p>
                      </div>
                    </div>
                    {button.requiresInput && !isLoading && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        ↓
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {!isDisabled && (
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300
                  `} />
                )}
              </motion.button>

              <AnimatePresence>
                {isExpanded && button.requiresInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={inputValues[button.id] || ''}
                        onChange={(e) => handleInputChange(button.id, e.target.value)}
                        placeholder={button.placeholder}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleInputSubmit(button.id);
                          }
                        }}
                      />
                      <motion.button
                        onClick={() => handleInputSubmit(button.id)}
                        disabled={!inputValues[button.id]?.trim()}
                        className={`
                          px-4 py-3 rounded-lg bg-gradient-to-r ${button.gradient} text-white font-medium transition-all duration-200
                          ${!inputValues[button.id]?.trim() 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:shadow-lg hover:scale-105'
                          }
                        `}
                        whileHover={inputValues[button.id]?.trim() ? { scale: 1.05 } : {}}
                        whileTap={inputValues[button.id]?.trim() ? { scale: 0.95 } : {}}
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActionButtons;