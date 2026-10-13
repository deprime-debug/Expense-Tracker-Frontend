import React from 'react';

const DEFAULT_CATS = ['Food', 'Groceries', 'Fuel', 'Other'];

export default function TransactionLedger({ expenses = [], onDeleteExpense }) {
  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}" from your ledger?`)) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="card">
      <h2>Transaction info</h2>
      <div className="sub">every entry, latest first</div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          No entries yet — add your first expense on the left.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, idx) => {
              const tagClass = DEFAULT_CATS.includes(expense.category)
                ? expense.category
                : 'Custom';

              return (
                <tr key={expense.id || idx}>
                  <td>
                    <strong>{expense.name}</strong>
                    <br />
                    <span
                      style={{
                        color: '#a39c87',
                        fontSize: '11px',
                        fontFamily: "'IBM Plex Mono', monospace"
                      }}
                    >
                      {formatDate(expense.date)}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${tagClass}`}>{expense.category}</span>
                  </td>
                  <td className="amt-col">
                    ₹{formatCurrency(expense.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="del-btn"
                      onClick={() => handleDelete(expense.id, expense.name)}
                      title="Delete transaction"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
