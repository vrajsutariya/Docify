import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '../common/Card';

// Brand colors from SRS Page 8
export const CHART_COLORS = [
  '#DC2626', // Red
  '#F97316', // Orange
  '#FACC15', // Yellow
  '#3B82F6', // Blue
  '#525252', // Dark Neutral
  '#A3A3A3', // Light Neutral
  '#10B981', // Emerald
  '#8B5CF6', // Purple
];

/**
 * Custom Theme-Aware Tooltip
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-surface/95 dark:bg-dark-surface/95 border border-light-border dark:border-dark-border rounded-xl shadow-xl p-3 text-xs backdrop-blur pointer-events-none space-y-1">
        {label !== undefined && (
          <p className="font-heading font-bold text-light-heading dark:text-dark-heading pb-1 border-b border-light-border/60 dark:border-dark-border/60">
            {String(label)}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-light-body dark:text-dark-body font-medium">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color || entry.fill || CHART_COLORS[index % CHART_COLORS.length] }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-light-heading dark:text-dark-heading">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AutoChart = ({
  chartConfig,
  height = 280,
  showTitle = true,
  className = '',
}) => {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return (
      <Card className={`flex items-center justify-center p-8 text-center text-xs text-light-body/60 dark:text-dark-body/60 ${className}`}>
        No chart data available to render.
      </Card>
    );
  }

  const {
    title,
    type = 'bar',
    xAxis,
    yAxis,
    yAxes = [],
    data = [],
  } = chartConfig;

  const yKeys = yAxes.length > 0 ? yAxes : [yAxis || 'value'];

  // Format axis tick labels to prevent clutter
  const formatTick = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.length > 14 ? str.slice(0, 12) + '...' : str;
  };

  const renderChartBody = () => {
    switch (type.toLowerCase()) {
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 10, fill: '#71717A' }}
              tickFormatter={formatTick}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 10, fill: '#71717A' }} width={45} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />}
            {yKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 10, fill: '#71717A' }}
              tickFormatter={formatTick}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 10, fill: '#71717A' }} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={yKeys[0]}
              stroke="#DC2626"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Pie
              data={data}
              dataKey={yKeys[0]}
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey={xAxis} tick={{ fontSize: 10, fill: '#71717A' }} name={xAxis} />
            <YAxis dataKey={yKeys[0]} tick={{ fontSize: 10, fill: '#71717A' }} name={yKeys[0]} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name={title || 'Data Points'} data={data} fill="#DC2626" />
          </ScatterChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis
              dataKey={xAxis}
              tick={{ fontSize: 10, fill: '#71717A' }}
              tickFormatter={formatTick}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 10, fill: '#71717A' }} width={45} />
            <Tooltip content={<CustomTooltip />} />
            {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />}
            {yKeys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      {showTitle && title && (
        <div className="flex items-center justify-between pb-2 border-b border-light-border/60 dark:border-dark-border/60">
          <h4 className="font-heading font-semibold text-xs sm:text-sm text-light-heading dark:text-dark-heading truncate">
            {title}
          </h4>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-light-border/40 dark:bg-dark-border/40 text-light-body dark:text-dark-body font-semibold">
            {type}
          </span>
        </div>
      )}

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChartBody()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AutoChart;
