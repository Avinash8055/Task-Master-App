import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { themes } from '../styles/themes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics: React.FC = () => {
  const { theme } = useTheme();
  const { getCompletionStats } = useTasks();
  const themeColor = themes[theme].chartColor;

  // Get weekly data
  const weeklyData = getCompletionStats();

  return (
    <div className={`${themes[theme].secondary} rounded-lg p-6 shadow-lg`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${themes[theme].text}`}>Weekly Analytics</h2>
      </div>
      
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            layout="horizontal"
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              height={40}
            />
            <YAxis 
              width={30}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ fontSize: '12px' }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              align="center"
            />
            <Bar 
              dataKey="completed" 
              name="Completed Tasks" 
              fill={themeColor} 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
            <Bar 
              dataKey="total" 
              name="Total Tasks" 
              fill={`${themeColor}80`}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;