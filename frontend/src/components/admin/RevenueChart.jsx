/**
 * RevenueChart Component
 * Revenue analytics chart for admin dashboard
 */

import React, { useState, useEffect } from 'react';
import { LineChart, BarChart } from '../ui/Chart';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

const RevenueChart = ({ 
  data, 
  loading = false, 
  timeRange = '12m',
  onTimeRangeChange 
}) => {
  const [chartType, setChartType] = useState('line');
  const [processedData, setProcessedData] = useState(null);

  useEffect(() => {
    if (data) {
      // Process data for different time ranges
      const processed = processRevenueData(data, timeRange);
      setProcessedData(processed);
    }
  }, [data, timeRange]);

  const processRevenueData = (rawData, range) => {
    // This would typically process your raw data based on the time range
    // For demo purposes, we'll generate sample data
    const labels = generateTimeLabels(range);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: rawData?.revenue || generateSampleData(labels.length, 5000, 2000),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Profit',
          data: rawData?.profit || generateSampleData(labels.length, 2000, 800),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const generateTimeLabels = (range) => {
    const labels = [];
    const now = new Date();
    
    switch (range) {
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.getDate().toString());
        }
        break;
      case '12m':
      default:
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
    }
    
    return labels;
  };

  const generateSampleData = (length, base, variance) => {
    return Array.from({ length }, (_, i) => {
      const trend = i * (base * 0.1) / length; // Slight upward trend
      return Math.max(0, base + trend + (Math.random() - 0.5) * variance);
    });
  };

  const timeRangeOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '12 Months', value: '12m' }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-600">Track revenue and profit trends over time</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '400px' }}>
        {chartType === 'line' ? (
          <LineChart
            data={processedData}
            options={chartOptions}
            loading={loading}
          />
        ) : (
          <BarChart
            data={processedData}
            options={chartOptions}
            loading={loading}
          />
        )}
      </div>

      {/* Summary Stats */}
      {processedData && !loading && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${processedData.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${processedData.datasets[1].data.reduce((a, b) => a + b, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${Math.round(processedData.datasets[0].data.reduce((a, b) => a + b, 0) / processedData.datasets[0].data.length).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Avg. Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((processedData.datasets[1].data.reduce((a, b) => a + b, 0) / processedData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Profit Margin</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;