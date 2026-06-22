import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { FiMenu } from 'react-icons/fi';
import Upload from '../pages/Upload';
import useStore from '../store/useStore';

const Layout = ({ title, subtitle, action, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDataLoaded = useStore((state) => state.isDataLoaded);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar - fixed on large screens, hidden on small unless opened */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{!isDataLoaded ? "Welcome to LedgerLens" : title}</h1>
                <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl">{!isDataLoaded ? "Upload a transaction dataset to begin analysis." : subtitle}</p>
              </div>
              {action && isDataLoaded ? <div>{action}</div> : null}
            </div>

            {/* Content Slot / Upload Splash */}
            {!isDataLoaded ? (
               <div className="max-w-3xl mx-auto mt-12 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                  <div className="text-center mb-8">
                     <h2 className="text-2xl font-bold text-white mb-2">Start Your Analysis</h2>
                     <p className="text-slate-400">Upload a CSV file containing transaction records, or load the sample dataset to test the platform.</p>
                  </div>
                  <Upload />
               </div>
            ) : (
               <div className="space-y-6 sm:space-y-8">{children}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
