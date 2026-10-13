import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DEFAULT_CATS = ['Food', 'Groceries', 'Fuel', 'Other'];
const CAT_COLORS = {
  Food: '#BC4B51',
  Groceries: '#1B4332',
  Fuel: '#E0A458',
  Other: '#6c5b7b',
  Custom: '#4A5568'
};
const DEFAULT_CUSTOM_COLOR = '#4A5568';

export default function ExpenseCharts({ expenses = [] }) {
  const { labels, data, colors, total, legendItems } = useMemo(() => {
    // Collect all unique categories
    const customCats = expenses
      .map(e => e.category)
      .filter(c => !DEFAULT_CATS.includes(c));
    const allCategories = Array.from(new Set([...DEFAULT_CATS, ...customCats]));

    const totals = {};
    allCategories.forEach(c => (totals[c] = 0));

    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + (Number(e.amount) || 0);
    });

    const calculatedData = allCategories.map(c => totals[c]);
    const calculatedColors = allCategories.map(c => CAT_COLORS[c] || DEFAULT_CUSTOM_COLOR);
    const sum = calculatedData.reduce((a, b) => a + b, 0);

    const legend = allCategories
      .map((cat, idx) => ({
        category: cat,
        amount: calculatedData[idx],
        color: calculatedColors[idx],
        percentage: sum > 0 ? Math.round((calculatedData[idx] / sum) * 100) : 0
      }))
      .filter(item => item.amount > 0);

    return {
      labels: allCategories,
      data: calculatedData,
      colors: calculatedColors,
      total: sum,
      legendItems: legend
    };
  }, [expenses]);

  const barData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderRadius: 6,
        maxBarThickness: 46
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) => ` ₹${Number(c.raw).toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#ece6d6' },
        ticks: {
          font: { family: "'IBM Plex Mono', monospace", size: 11 },
          color: '#928c79'
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 12, weight: '600' },
          color: '#3A3A3A'
        }
      }
    }
  };

  const doughnutData = {
    labels,
    datasets: [
      {
        data: total > 0 ? data : [1],
        backgroundColor: total > 0 ? colors : ['#E8E3D7'],
        borderWidth: 3,
        borderColor: '#FAF7F0'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: total > 0,
        callbacks: {
          label: (c) => ` ₹${Number(c.raw).toLocaleString('en-IN')}`
        }
      }
    }
  };

  return (
    <div className="charts-row">
      <div className="card">
        <h2>Spending by category</h2>
        <div className="sub">where the money actually goes</div>
        <div className="chart-box">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="card">
        <h2>Allocation</h2>
        <div className="sub">share of total spend</div>
        <div className="chart-box">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <ul className="legend-list">
          {legendItems.length > 0 ? (
            legendItems.map((item) => (
              <li key={item.category}>
                <span>
                  <span className="dot" style={{ background: item.color }} />
                  {item.category}
                </span>
                <span>{item.percentage}%</span>
              </li>
            ))
          ) : (
            <li style={{ justifyContent: 'center', color: '#a39c87' }}>
              No expenses recorded yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
