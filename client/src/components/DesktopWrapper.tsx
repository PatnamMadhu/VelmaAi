import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, X, Monitor } from 'lucide-react';

interface DesktopWrapperProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
    isDesktop?: boolean;
  }
}

export function DesktopWrapper({ children }: DesktopWrapperProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI || window.isDesktop) {
      setIsDesktop(true);
      
      // Get app info if available
      if (window.electronAPI) {
        window.electronAPI.getAppVersion().then(setAppVersion).catch(() => {});
        window.electronAPI.getPlatform().then(setPlatform).catch(() => {});
      }
    }
  }, []);

  if (!isDesktop) {
    // Return web version unchanged
    return <>{children}</>;
  }

  // Desktop version with enhanced features
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Title Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between drag-region">
        <div className="flex items-center space-x-3">
          <Monitor className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-800">VelariAI Desktop</span>
          {appVersion && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              v{appVersion}
            </span>
          )}
        </div>
        
        {/* Window Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => window.electronAPI?.minimize()}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => window.electronAPI?.maximize()}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            onClick={() => window.electronAPI?.close()}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Desktop Content */}
      <div className="relative">
        {/* Desktop Enhancement Overlay */}
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-lg">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Desktop Mode</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[calc(100vh-60px)]">
          {children}
        </div>
      </div>

      {/* Desktop Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Platform: {platform || 'Unknown'}</span>
            <span>Mode: Desktop Application</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}