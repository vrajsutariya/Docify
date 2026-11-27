import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  LineChart,
  PieChart,
  AreaChart,
  Sliders,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AutoChart } from '../charts/AutoChart';

export const CustomChartBuilder = ({
  columns = [],
  rows = [],
  onSaveChart,
}) => {
  const numericColumns = useMemo(() => columns.filter((c) => c.type === 'numeric'), [columns]);
  const categoricalColumns = useMemo(() => columns.filter((c) => c.type !== 'numeric' || c.uniqueCount <= 50), [columns]);

  const [chartType, setChartType] = useState('bar');
  const [xAxisCol, setXAxisCol] = useState(categoricalColumns[0]?.name || columns[0]?.name || '');
  const [yAxisCol, setYAxisCol] = useState(numericColumns[0]?.name || '');
  const [aggregation, setAggregation] = useState('sum'); // 'sum' | 'average' | 'count' | 'min' | 'max'

  // Build dynamic chart data from rows
  const dynamicChartConfig = useMemo(() => {
    if (!xAxisCol || rows.length === 0) return null;

    const map = new Map();

    rows.forEach((r) => {
      const xVal = String(r[xAxisCol] || 'Other');
      const yVal = yAxisCol ? Number(String(r[yAxisCol] || 0).replace(/,/g, '')) : 1;
      const validY = Number.isNaN(yVal) ? 0 : yVal;

      if (!map.has(xVal)) {
        map.set(xVal, { sum: 0, count: 0, min: validY, max: validY });
      }
      const curr = map.get(xVal);
      curr.sum += validY;
      curr.count += 1;
      curr.min = Math.min(curr.min, validY);
      curr.max = Math.max(curr.max, validY);
    });

    const metricKey = yAxisCol || 'count';
    const chartData = Array.from(map.entries())
      .slice(0, 15) // limit to top 15 categories for clean visual
      .map(([k, v]) => {
        let finalVal = v.sum;
        if (aggregation === 'average') finalVal = v.sum / (v.count || 1);
        else if (aggregation === 'count') finalVal = v.count;
        else if (aggregation === 'min') finalVal = v.min;
        else if (aggregation === 'max') finalVal = v.max;

        return {
          [xAxisCol]: k,
          [metricKey]: parseFloat(finalVal.toFixed(2)),
        };
      });

    return {
      title: `${aggregation.toUpperCase()}(${metricKey}) by ${xAxisCol}`,
      type: chartType,
      xAxis: xAxisCol,
      yAxis: metricKey,
      data: chartData,
    };
  }, [rows, xAxisCol, yAxisCol, aggregation, chartType]);

  return (
    <Card className="p-6 space-y-5 border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand-orange" />
          <h3 className="font-heading font-bold text-sm sm:text-base text-light-heading dark:text-dark-heading">
            Custom Visual Dashboard Builder
          </h3>
        </div>

        {onSaveChart && dynamicChartConfig && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSaveChart(dynamicChartConfig)}
            leftIcon={Plus}
          >
            Pin to Dashboard
          </Button>
        )}
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        {/* 1. Chart Type */}
        <div className="space-y-1.5">
          <label className="font-semibold text-light-body dark:text-dark-body block">
            Chart Type
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
            {[
              { id: 'bar', icon: BarChart2, label: 'Bar' },
              { id: 'line', icon: LineChart, label: 'Line' },
              { id: 'area', icon: AreaChart, label: 'Area' },
              { id: 'pie', icon: PieChart, label: 'Pie' },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setChartType(t.id)}
                  className={`p-1.5 rounded-lg flex flex-col items-center gap-0.5 transition-all ${
                    chartType === t.id
                      ? 'bg-brand-red text-white shadow-xs'
                      : 'text-light-body dark:text-dark-body hover:bg-light-border/40'
                  }`}
                  title={t.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. X-Axis (Dimension) */}
        <div className="space-y-1.5">
          <label className="font-semibold text-light-body dark:text-dark-body block">
            X-Axis (Dimension / Category)
          </label>
          <select
            value={xAxisCol}
            onChange={(e) => setXAxisCol(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        {/* 3. Y-Axis (Metric) */}
        <div className="space-y-1.5">
          <label className="font-semibold text-light-body dark:text-dark-body block">
            Y-Axis (Numeric Metric)
          </label>
          <select
            value={yAxisCol}
            onChange={(e) => setYAxisCol(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Row Count (Frequency)</option>
            {numericColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Aggregation Method */}
        <div className="space-y-1.5">
          <label className="font-semibold text-light-body dark:text-dark-body block">
            Aggregation Formula
          </label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value)}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="sum">SUM</option>
            <option value="average">AVERAGE (Mean)</option>
            <option value="count">COUNT</option>
            <option value="max">MAX</option>
            <option value="min">MIN</option>
          </select>
        </div>
      </div>

      {/* Real-Time Live Chart Preview */}
      {dynamicChartConfig && (
        <div className="pt-2">
          <AutoChart chartConfig={dynamicChartConfig} height={320} />
        </div>
      )}
    </Card>
  );
};

export default CustomChartBuilder;
