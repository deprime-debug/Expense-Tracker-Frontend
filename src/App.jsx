import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import BudgetStrip from './components/BudgetStrip';
import ExpenseForm from './components/ExpenseForm';
import ExpenseCharts from './components/ExpenseCharts';
import TransactionLedger from './components/TransactionLedger';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import {
  apiGetExpenses,
  apiCreateExpense,
  apiDeleteExpense,
  apiResetAllData
} from './services/api';

export default function App() {
  const { user, isAuthenticated, updateUserSalary } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Load user data whenever authentication state changes
  const loadUserData = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const expenseList = await apiGetExpenses();
        setExpenses(expenseList);
      } catch (err) {
        console.error('Failed to load expenses from backend:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // In guest mode, fall back to localStorage
      try {
        const saved = localStorage.getItem('cacheflow_guest_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          setExpenses(parsed.expenses || []);
        } else {
          setExpenses([]);
        }
      } catch {
        setExpenses([]);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle salary save
  const handleSaveSalary = async (newSalary) => {
    if (isAuthenticated) {
      await updateUserSalary(newSalary);
    } else {
      // Guest local storage
      const guestState = JSON.parse(localStorage.getItem('cacheflow_guest_state') || '{}');
      guestState.salary = newSalary;
      localStorage.setItem('cacheflow_guest_state', JSON.stringify(guestState));
      // Prompt user to login to persist in MySQL
      setAuthModalOpen(true);
    }
  };

  // Handle add expense
  const handleAddExpense = async (expenseData) => {
    if (isAuthenticated) {
      const created = await apiCreateExpense(expenseData);
      setExpenses((prev) => [created, ...prev]);
    } else {
      // Guest local state
      const newEntry = {
        id: Date.now(),
        ...expenseData,
        date: new Date().toISOString()
      };
      setExpenses((prev) => {
        const next = [newEntry, ...prev];
        const guestState = JSON.parse(localStorage.getItem('cacheflow_guest_state') || '{}');
        guestState.expenses = next;
        localStorage.setItem('cacheflow_guest_state', JSON.stringify(guestState));
        return next;
      });
      // Suggest login
      setAuthModalOpen(true);
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async (id) => {
    if (isAuthenticated) {
      try {
        await apiDeleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        alert('Could not delete expense: ' + err.message);
      }
    } else {
      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id);
        const guestState = JSON.parse(localStorage.getItem('cacheflow_guest_state') || '{}');
        guestState.expenses = next;
        localStorage.setItem('cacheflow_guest_state', JSON.stringify(guestState));
        return next;
      });
    }
  };

  // Handle reset all data
  const handleResetData = async () => {
    if (window.confirm('Clear monthly salary and all expenses? This will erase your data from MySQL and cannot be undone.')) {
      if (isAuthenticated) {
        try {
          await apiResetAllData();
          await updateUserSalary(0);
          setExpenses([]);
        } catch (err) {
          alert('Failed to reset data: ' + err.message);
        }
      } else {
        localStorage.removeItem('cacheflow_guest_state');
        setExpenses([]);
      }
    }
  };

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const currentSalary = isAuthenticated ? (user?.salary || 0) : 0;

  return (
    <div className="wrap">
      <Navbar onOpenAuth={handleOpenAuth} />

      {!isAuthenticated && (
        <div
          style={{
            background: 'rgba(224, 164, 88, 0.12)',
            border: '1px solid rgba(224, 164, 88, 0.3)',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            color: 'var(--paper)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
            <span>🔒</span>
            <span>
              <strong>MySQL &amp; JWT Enabled:</strong> Sign in or create an account to store your ledger securely in the database.
            </span>
          </div>
          <button
            className="btn-auth-nav primary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={() => handleOpenAuth('login')}
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Financial Status Receipt */}
      <BudgetStrip salary={currentSalary} expenses={expenses} />

      {/* Grid Layout */}
      <div className="grid">
        <ExpenseForm
          currentSalary={currentSalary}
          onSaveSalary={handleSaveSalary}
          onAddExpense={handleAddExpense}
          onResetData={handleResetData}
        />

        <div>
          <ExpenseCharts expenses={expenses} />
          <TransactionLedger
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>

      <footer>
        CacheFlow · Spring Boot 3 &amp; MySQL Backend · JWT Authentication · React &amp; Chart.js Frontend
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={loadUserData}
      />
    </div>
  );
}
