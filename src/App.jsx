import { Routes, Route, BrowserRouter } from 'react-router-dom';
import TimeImageTable from './components/TimeImageTable';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import SleepDurationChart from './components/SleepDurationChart';
import SleepRowBarChart from './components/SleepRowBarChart';

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col justify-center items-center space-y-10 p-4">
          <h1 className="text-5xl font-bold text-purple-500">Sleep Monitoring</h1>
          <div className="w-full max-w-4xl">
            <Routes>
              <Route path="/" element={<TimeImageTable />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/durations" element={<SleepDurationChart />} />
              <Route path="/row" element={<SleepRowBarChart />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;