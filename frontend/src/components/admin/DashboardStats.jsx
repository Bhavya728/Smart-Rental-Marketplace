/**
 * DashboardStats Component
 * Overview statistics for the admin dashboard
 */

import React from 'react';
import StatCard, { RevenueCard, UsersCard, ListingsCard, BookingsCard } from '../ui/StatCard';

const DashboardStats = ({ stats, loading = false }) => {
  const {
    revenue = {},
    users = {},
    listings = {},
    bookings = {},
    performance = {}
  } = stats || {};

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard
          amount={revenue.total}
          change={revenue.growth}
          period="this month"
          loading={loading}
        />
        
        <UsersCard
          total={users.total}
          active={users.active}
          growth={users.growth}
          loading={loading}
        />
        
        <ListingsCard
          total={listings.total}
          published={listings.published}
          pending={listings.pending}
          loading={loading}
        />
        
        <BookingsCard
          total={bookings.total}
          confirmed={bookings.confirmed}
          cancelled={bookings.cancelled}
          loading={loading}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg. Booking Value"
          value={`$${revenue.avgBooking?.toFixed(2) || '0.00'}`}
          subtitle="Per booking"
          trend={revenue.avgBookingTrend > 0 ? 'up' : revenue.avgBookingTrend < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(revenue.avgBookingTrend || 0)}%`}
          trendLabel="from last month"
          variant="success"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
        />
        
        <StatCard
          title="Conversion Rate"
          value={`${performance.conversionRate?.toFixed(1) || '0.0'}%`}
          subtitle="Visitor to booking"
          trend={performance.conversionTrend > 0 ? 'up' : performance.conversionTrend < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(performance.conversionTrend || 0).toFixed(1)}%`}
          trendLabel="change"
          variant="info"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        />
        
        <StatCard
          title="Response Time"
          value={`${performance.avgResponseTime || 0}h`}
          subtitle="Avg. host response"
          trend={performance.responseTimeTrend < 0 ? 'up' : performance.responseTimeTrend > 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(performance.responseTimeTrend || 0)}h`}
          trendLabel={performance.responseTimeTrend < 0 ? 'faster' : 'slower'}
          variant="warning"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        />
        
        <StatCard
          title="Customer Rating"
          value={`${performance.avgRating?.toFixed(1) || '0.0'}★`}
          subtitle="Platform average"
          trend={performance.ratingTrend > 0 ? 'up' : performance.ratingTrend < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(performance.ratingTrend || 0).toFixed(1)}`}
          trendLabel="rating change"
          variant="gradient"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )}
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Server Uptime"
          value={`${performance.uptime || 99.9}%`}
          subtitle="Last 30 days"
          variant="success"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        />
        
        <StatCard
          title="Active Sessions"
          value={users.activeSessions?.toLocaleString() || '0'}
          subtitle="Current users online"
          variant="info"
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
        />
        
        <StatCard
          title="Storage Used"
          value={`${performance.storageUsed || 0}GB`}
          subtitle={`of ${performance.storageTotal || 100}GB`}
          trend={performance.storageUsed > (performance.storageTotal * 0.8) ? 'warning' : 'neutral'}
          variant={performance.storageUsed > (performance.storageTotal * 0.8) ? 'warning' : 'default'}
          loading={loading}
          icon={() => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          )}
        />
      </div>
    </div>
  );
};

export default DashboardStats;