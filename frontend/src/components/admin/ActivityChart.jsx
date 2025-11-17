/**
 * ActivityChart Component
 * User activity and engagement analytics chart
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, DoughnutChart } from '../ui/Chart';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

const ActivityChart = ({ 
  data, 
  loading = false, 
  timeRange = '7d',
  onTimeRangeChange 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [processedData, setProcessedData] = useState({});

  useEffect(() => {
    if (data) {
      const processed = processActivityData(data, timeRange);
      setProcessedData(processed);
    }
  }, [data, timeRange]);

  const processActivityData = (rawData, range) => {
    const labels = generateTimeLabels(range);
    
    return {
      overview: {
        labels,
        datasets: [
          {
            label: 'Active Users',
            data: rawData?.activeUsers || generateSampleData(labels.length, 150, 50),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'New Signups',
            data: rawData?.newSignups || generateSampleData(labels.length, 25, 15),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Page Views',
            data: rawData?.pageViews || generateSampleData(labels.length, 500, 200),
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      userTypes: {
        labels: ['Hosts', 'Guests', 'Admins', 'Inactive'],
        datasets: [{
          data: rawData?.userTypes || [45, 35, 5, 15],
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(168, 85, 247)',
            'rgb(156, 163, 175)'
          ],
          borderWidth: 0
        }]
      },
      engagement: {
        labels,
        datasets: [
          {
            label: 'Session Duration (min)',
            data: rawData?.sessionDuration || generateSampleData(labels.length, 15, 8),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Bounce Rate (%)',
            data: rawData?.bounceRate || generateSampleData(labels.length, 35, 15),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      }
    };
  };

  const generateTimeLabels = (range) => {
    const labels = [];
    const now = new Date();
    
    switch (range) {
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const hour = (now.getHours() - i + 24) % 24;
          labels.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        break;
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
      default:
        return labels;
    }
    
    return labels;
  };

  const generateSampleData = (length, base, variance) => {
    return Array.from({ length }, () => 
      Math.max(0, base + (Math.random() - 0.5) * variance)
    );
  };

  const timeRangeOptions = [
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' }
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
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
          <p className="text-sm text-gray-600">Monitor user engagement and platform activity</p>
        </div>
        
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="userTypes">User Types</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div style={{ height: '350px' }}>
            <AreaChart
              data={processedData.overview}
              options={chartOptions}
              loading={loading}
            />
          </div>
          
          {processedData.overview && !loading && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round(processedData.overview.datasets[0].data.reduce((a, b) => a + b, 0) / processedData.overview.datasets[0].data.length)}
                  </div>
                  <div className="text-sm text-gray-500">Avg. Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {processedData.overview.datasets[1].data.reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total New Signups</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {processedData.overview.datasets[2].data.reduce((a, b) => a + b, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Page Views</div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="userTypes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ height: '300px' }}>
              <DoughnutChart
                data={processedData.userTypes}
                options={doughnutOptions}
                loading={loading}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">User Distribution</h4>
              {processedData.userTypes?.datasets?.[0]?.data.map((value, index) => {
                const label = processedData.userTypes.labels[index];
                const total = processedData.userTypes.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-gray-400'
                ];
                
                return (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{value}%</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div style={{ height: '350px' }}>
            <AreaChart
              data={processedData.engagement}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales.y,
                    beginAtZero: true
                  }
                }
              }}
              loading={loading}
            />
          </div>
          
          {processedData.engagement && !loading && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {Math.round(processedData.engagement.datasets[0].data.reduce((a, b) => a + b, 0) / processedData.engagement.datasets[0].data.length)} min
                  </div>
                  <div className="text-sm text-gray-500">Avg. Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    {Math.round(processedData.engagement.datasets[1].data.reduce((a, b) => a + b, 0) / processedData.engagement.datasets[1].data.length)}%
                  </div>
                  <div className="text-sm text-gray-500">Avg. Bounce Rate</div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityChart;