// components/ErrorBoundary.js
import React from 'react';

/**
 * A React component that catches JavaScript errors anywhere in its child component tree.
 * Displays a fallback UI when an error occurs instead of crashing the application.
 * In development mode, it also shows detailed error information and stack traces.
 * 
 * @component
 * @extends {React.Component}
 * 
 * @example
 * <ErrorBoundary>
 *   <ChildComponent />
 * </ErrorBoundary>
 * 
 * @property {React.ReactNode} children - The child components to be rendered and monitored for errors
 * @property {Object} state - Contains error state information
 * @property {boolean} state.hasError - Indicates if an error has occurred
 * @property {Error|null} state.error - The error object if an error occurred
 * @property {Object|null} state.errorInfo - Additional information about the error
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-red-100">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-slate-600 mb-6">
                An error occurred while rendering this component
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-4">
                  <div className="bg-slate-50 rounded p-4 mb-2 overflow-auto text-left">
                    <p className="font-mono text-sm text-slate-800">
                      {this.state.error.toString()}
                    </p>
                  </div>
                  <details className="text-left">
                    <summary className="text-sm text-slate-600 cursor-pointer hover:text-slate-800">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs text-slate-600 overflow-auto">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;