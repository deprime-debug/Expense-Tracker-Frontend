import React from 'react';

export default function BudgetStrip({ salary = 0, expenses = [] }) {
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remaining = salary - totalSpent;
  const isOverspent = remaining < 0;

  const percentageSpent = salary > 0 ? Math.min(100, (totalSpent / salary) * 100) : (totalSpent > 0 ? 100 : 0);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="receipt">
      <div className="receipt-head">
        <span>{todayStr}</span>
        <span>CACHEFLOW · LEDGER NO. 0001</span>
      </div>

      <div className="receipt-row">
        <div className="receipt-item">
          <div className="label">Monthly salary</div>
          <div className="amount">
            <small>₹</small>
            <span>{formatCurrency(salary)}</span>
          </div>
        </div>

        <div className="receipt-item">
          <div className="label">Total spent</div>
          <div className="amount">
            <small>₹</small>
            <span>{formatCurrency(totalSpent)}</span>
          </div>
        </div>

        <div className={`receipt-item remaining ${isOverspent ? 'negative' : ''}`}>
          <div className="label">
            {isOverspent ? 'Overspent by' : 'Remaining'}
          </div>
          <div className="amount">
            <small>₹</small>
            <span>{formatCurrency(Math.abs(remaining))}</span>
          </div>
        </div>
      </div>

      <div className={`receipt-bar ${isOverspent ? 'over' : ''}`}>
        <div style={{ width: `${percentageSpent}%` }} />
      </div>
    </div>
  );
}
