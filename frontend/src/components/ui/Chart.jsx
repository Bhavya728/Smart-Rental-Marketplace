/**
 * Chart Component
 * Comprehensive chart component supporting multiple chart types with Chart.js
 */

import React, { useRef, useEffect, useState } from 'react';
import 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Doughnut,
  Pie,
  Radar,
  PolarArea
} from 'react-chartjs-2';
import { cn } from '../../utils/cn';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Chart = ({
  type = 'line',
  data,
  options = {},
  loading = false,
  error = null,
  title,
  subtitle,
  height = 400,
  className = '',
  theme = 'default',
  responsive = true,
  ...props
}) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(data);

  // Theme configurations
  const themes = {
    default: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgb(59, 130, 246)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#374151'
    },
    dark: {
      background: 'rgba(156, 163, 175, 0.1)',
      border: 'rgb(156, 163, 175)',
      grid: 'rgba(255, 255, 255, 0.1)',
      text: '#f3f4f6'
    },
    success: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgb(34, 197, 94)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#374151'
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgb(245, 158, 11)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#374151'
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgb(239, 68, 68)',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#374151'
    }
  };

  // Default chart options
  const defaultOptions = {
    responsive,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: themes[theme]?.text || themes.default.text,
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: themes[theme]?.border || themes.default.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: type !== 'doughnut' && type !== 'pie' && type !== 'polarArea' && type !== 'radar' ? {
      x: {
        grid: {
          color: themes[theme]?.grid || themes.default.grid,
          borderColor: themes[theme]?.grid || themes.default.grid
        },
        ticks: {
          color: themes[theme]?.text || themes.default.text
        }
      },
      y: {
        grid: {
          color: themes[theme]?.grid || themes.default.grid,
          borderColor: themes[theme]?.grid || themes.default.grid
        },
        ticks: {
          color: themes[theme]?.text || themes.default.text
        }
      }
    } : {}
  };

  // Merge default options with custom options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins
    }
  };

  // Apply theme to data if not already themed
  useEffect(() => {
    if (data && !data._themed) {
      const themedData = { ...data };
      const themeConfig = themes[theme] || themes.default;
      
      if (themedData.datasets) {
        themedData.datasets = themedData.datasets.map((dataset, index) => {
          const colors = [
            'rgb(59, 130, 246)', // blue
            'rgb(34, 197, 94)',  // green
            'rgb(245, 158, 11)', // yellow
            'rgb(239, 68, 68)',  // red
            'rgb(168, 85, 247)', // purple
            'rgb(236, 72, 153)', // pink
            'rgb(20, 184, 166)', // teal
            'rgb(251, 146, 60)'  // orange
          ];
          
          return {
            ...dataset,
            borderColor: dataset.borderColor || colors[index % colors.length],
            backgroundColor: dataset.backgroundColor || 
              (type === 'line' ? 
                colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)') :
                colors[index % colors.length]
              ),
            fill: type === 'area' ? true : dataset.fill
          };
        });
      }
      
      themedData._themed = true;
      setChartData(themedData);
    } else {
      setChartData(data);
    }
  }, [data, theme, type]);

  const renderChart = () => {
    if (!chartData) return null;

    const ChartComponent = {
      line: Line,
      area: Line,
      bar: Bar,
      doughnut: Doughnut,
      pie: Pie,
      radar: Radar,
      polarArea: PolarArea
    }[type];

    if (!ChartComponent) {
      return <div className="text-red-500">Unsupported chart type: {type}</div>;
    }

    return (
      <ChartComponent
        ref={chartRef}
        data={chartData}
        options={mergedOptions}
        {...props}
      />
    );
  };

  const containerClasses = cn(
    'bg-white rounded-xl border border-gray-200 shadow-sm',
    className
  );

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="p-6">
          {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm">Error loading chart</p>
              {error.message && <p className="text-xs mt-1 text-gray-500">{error.message}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="p-6">
          {title && <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>}
          {subtitle && <div className="h-4 bg-gray-100 rounded w-1/2 mb-6 animate-pulse"></div>}
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="p-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
        <div style={{ height: height }}>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

// Predefined chart components
const LineChart = (props) => <Chart type="line" {...props} />;
const AreaChart = (props) => <Chart type="area" {...props} />;
const BarChart = (props) => <Chart type="bar" {...props} />;
const DoughnutChart = (props) => <Chart type="doughnut" {...props} />;
const PieChart = (props) => <Chart type="pie" {...props} />;
const RadarChart = (props) => <Chart type="radar" {...props} />;
const PolarAreaChart = (props) => <Chart type="polarArea" {...props} />;

// Sample data generators
const generateSampleData = (type = 'line', months = 12) => {
  const labels = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }

  const generateValues = (base = 100, variance = 50) => 
    Array.from({ length: months }, () => 
      Math.max(0, base + (Math.random() - 0.5) * variance * 2)
    );

  switch (type) {
    case 'revenue':
      return {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: generateValues(5000, 2000),
            tension: 0.4
          },
          {
            label: 'Profit',
            data: generateValues(2000, 1000),
            tension: 0.4
          }
        ]
      };
    
    case 'users':
      return {
        labels,
        datasets: [
          {
            label: 'Total Users',
            data: generateValues(1000, 300),
            tension: 0.4
          },
          {
            label: 'Active Users',
            data: generateValues(600, 200),
            tension: 0.4
          }
        ]
      };
    
    case 'bookings':
      return {
        labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
        datasets: [
          {
            label: 'Bookings',
            data: [45, 25, 8, 22],
            backgroundColor: [
              'rgb(34, 197, 94)',
              'rgb(245, 158, 11)',
              'rgb(239, 68, 68)',
              'rgb(59, 130, 246)'
            ]
          }
        ]
      };
    
    default:
      return {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: generateValues(),
            tension: 0.4
          }
        ]
      };
  }
};

// Example usage component
const ChartExample = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Chart Examples</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Revenue Trends"
          subtitle="Monthly revenue and profit"
          data={generateSampleData('revenue')}
          loading={loading}
          theme="success"
        />
        
        <AreaChart
          title="User Growth"
          subtitle="Total and active users over time"
          data={generateSampleData('users')}
          loading={loading}
          theme="default"
        />
      </div>

      {/* Bar and Doughnut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          title="Monthly Bookings"
          subtitle="Booking statistics by month"
          data={generateSampleData('line')}
          loading={loading}
          theme="warning"
        />
        
        <DoughnutChart
          title="Booking Status"
          subtitle="Current booking distribution"
          data={generateSampleData('bookings')}
          loading={loading}
          height={300}
        />
      </div>

      {/* Multiple chart types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieChart
          title="Categories"
          data={generateSampleData('bookings')}
          loading={loading}
          height={250}
        />
        
        <RadarChart
          title="Performance"
          data={{
            labels: ['Speed', 'Reliability', 'Comfort', 'Value', 'Service'],
            datasets: [{
              label: 'Rating',
              data: [8, 9, 7, 8, 9],
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgb(59, 130, 246)',
              pointBackgroundColor: 'rgb(59, 130, 246)'
            }]
          }}
          loading={loading}
          height={250}
        />
        
        <PolarAreaChart
          title="Distribution"
          data={generateSampleData('bookings')}
          loading={loading}
          height={250}
        />
      </div>
    </div>
  );
};

export default Chart;
export {
  LineChart,
  AreaChart,
  BarChart,
  DoughnutChart,
  PieChart,
  RadarChart,
  PolarAreaChart,
  ChartExample,
  generateSampleData
};