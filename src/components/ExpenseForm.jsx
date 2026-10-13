import React, { useState, useEffect } from 'react';

const DEFAULT_CATS = ['Food', 'Groceries', 'Fuel', 'Other'];

export default function ExpenseForm({
  currentSalary = 0,
  onSaveSalary,
  onAddExpense,
  onResetData
}) {
  const [salaryInput, setSalaryInput] = useState('');
  const [salarySavedMsg, setSalarySavedMsg] = useState(false);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [customCat, setCustomCat] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);

  // Field validation error states
  const [nameError, setNameError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [customCatError, setCustomCatError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSalaryInput(currentSalary ? currentSalary.toString() : '');
  }, [currentSalary]);

  const handleSalarySave = async () => {
    const val = parseFloat(salaryInput);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid salary amount');
      return;
    }
    await onSaveSalary(val);
    setSalarySavedMsg(true);
    setTimeout(() => setSalarySavedMsg(false), 2000);
  };

  const handleSelectCat = (cat) => {
    if (cat === 'Custom') {
      setIsCustomSelected(true);
      setCategory('Custom');
    } else {
      setIsCustomSelected(false);
      setCategory(cat);
      setCustomCat('');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError(true);
      setTimeout(() => setNameError(false), 1500);
      valid = false;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError(true);
      setTimeout(() => setAmountError(false), 1500);
      valid = false;
    }

    let finalCategory = category;
    if (isCustomSelected) {
      if (!customCat.trim()) {
        setCustomCatError(true);
        setTimeout(() => setCustomCatError(false), 1500);
        valid = false;
      } else {
        finalCategory = customCat.trim();
      }
    }

    if (!valid) return;

    setSubmitting(true);
    try {
      await onAddExpense({
        name: name.trim(),
        amount: parseFloat(numAmount.toFixed(2)),
        category: finalCategory
      });

      // Reset form fields
      setName('');
      setAmount('');
      setCustomCat('');
      setIsCustomSelected(false);
      setCategory('Food');
    } catch (err) {
      alert('Failed to add expense: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Set up</h2>
      <div className="sub">salary &amp; new expense</div>

      {/* Salary Management */}
      <label htmlFor="salaryInput">Monthly salary</label>
      <div className="field-money">
        <input
          type="number"
          id="salaryInput"
          placeholder="0"
          min="0"
          step="0.01"
          value={salaryInput}
          onChange={(e) => setSalaryInput(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-green"
        onClick={handleSalarySave}
      >
        {salarySavedMsg ? '✓ Salary Saved' : 'Save salary'}
      </button>

      <hr className="div" />

      {/* New Expense Form */}
      <form onSubmit={handleAddSubmit}>
        <label htmlFor="expName">Expense name</label>
        <input
          type="text"
          id="expName"
          className={nameError ? 'input-error' : ''}
          placeholder="e.g. Pizza with friends"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="expAmount">Amount</label>
        <div className="field-money">
          <input
            type="number"
            id="expAmount"
            className={amountError ? 'input-error' : ''}
            placeholder="0"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <label>Category</label>
        <div className="cat-pills">
          {DEFAULT_CATS.map((cat) => (
            <div
              key={cat}
              className={`cat-pill ${!isCustomSelected && category === cat ? 'active' : ''}`}
              data-cat={cat}
              onClick={() => handleSelectCat(cat)}
            >
              {cat}
            </div>
          ))}
          <div
            className={`cat-pill ${isCustomSelected ? 'custom-active' : ''}`}
            data-cat="Custom"
            onClick={() => handleSelectCat('Custom')}
          >
            + Custom
          </div>
        </div>

        {isCustomSelected && (
          <div className="custom-cat-wrapper">
            <input
              type="text"
              className={customCatError ? 'input-error' : ''}
              placeholder="Enter custom category"
              value={customCat}
              onChange={(e) => setCustomCat(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-green"
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add expense'}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={onResetData}
        >
          Reset all data
        </button>
      </form>
    </div>
  );
}
