import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FraudAnalysis from "./pages/FraudAnalysis";
import Insights from "./pages/Insights";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fraud" element={<FraudAnalysis />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/:accountId" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;