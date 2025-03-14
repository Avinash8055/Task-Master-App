import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import Layout from './components/Layout';
import Splash from './components/Splash';
import DailyTasks from './pages/DailyTasks';
import PlannedTasks from './pages/PlannedTasks';
import FreeTasks from './pages/FreeTasks';
import Reminders from './pages/Reminders';
import Analytics from './pages/Analytics';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <ThemeProvider>
          <TaskProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<DailyTasks />} />
                  <Route path="/planned" element={<PlannedTasks />} />
                  <Route path="/free-time" element={<FreeTasks />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </Layout>
            </Router>
          </TaskProvider>
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
