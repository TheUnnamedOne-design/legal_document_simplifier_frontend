import React from 'react';
import { Database, Search, FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onAction: (action: string) => void;
  disabled: boolean;
  loading: string | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onAction, 
  disabled, 
  loading 
}) => {
  const buttons = [
    {
      id: 'ingest',
      label: 'Ingest Document',
      description: 'Process and analyze document structure',
      icon: Database,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'query',
      label: 'Query',
      description: 'Ask questions about the document',
      icon: Search,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'summary',
      label: 'Summary',
      description: 'Get key points and overview',
      icon: FileText,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'risk-analysis',
      label: 'Risk Analysis',
      description: 'Identify potential legal risks',
      icon: AlertTriangle,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        AI Analysis Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buttons.map((button, index) => {
          const Icon = button.icon;
          const isLoading = loading === button.id;
          
          return (
            <motion.button
              key={button.id}
              onClick={() => onAction(button.id)}
              disabled={disabled || isLoading}
              className={`
                relative group p-6 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden
                ${disabled && !isLoading
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed' 
                  : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-${button.color}-300 hover:shadow-lg hover:shadow-${button.color}-500/10`
                }
              `}
              whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`
                    p-2 rounded-lg bg-gradient-to-br ${button.gradient} 
                    ${isLoading ? 'animate-pulse' : ''}
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isLoading && (
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                  )}
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {button.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Processing...' : button.description}
                </p>
              </div>
              
              {!disabled && (
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${button.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300
                `} />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};