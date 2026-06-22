import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiShield,
  FiTrendingUp,
  FiFileText,
  FiUser,
  FiSettings,
  FiZap,
  FiX
} from "react-icons/fi";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const menu = [
    { label: "Dashboard", path: "/", icon: <FiHome className="w-5 h-5" />, color: "text-blue-400" },
    { label: "Fraud Analysis", path: "/fraud", icon: <FiShield className="w-5 h-5" />, color: "text-red-400" },
    { label: "Insights", path: "/insights", icon: <FiTrendingUp className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Transactions", path: "/transactions", icon: <FiFileText className="w-5 h-5" />, color: "text-green-400" },
    { label: "Profile", path: "/profile", icon: <FiUser className="w-5 h-5" />, color: "text-yellow-400" },
    { label: "Settings", path: "/settings", icon: <FiSettings className="w-5 h-5" />, color: "text-gray-400" },
  ];

  const sidebarClasses = "fixed inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 " + (isOpen ? "translate-x-0" : "-translate-x-full");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <div className="lg:block">
                <h1 className="text-xl font-bold text-white">LedgerLens</h1>
                <p className="text-xs text-slate-400">AML Intelligence</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {menu.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <span className={`${isActive ? 'text-blue-400' : item.color} group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full ml-auto"
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Fintech AML Suite</p>
              <p className="text-xs text-slate-500">v2.0 • Production Ready</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;