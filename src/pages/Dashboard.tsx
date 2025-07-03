import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Wallet, LogOut, Sun, Moon } from "lucide-react";

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string
};

const categories = ["Food", "Transport", "Bills", "Shopping" ,"School", "Other"];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

function getMonthYear(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Helper to format YYYY-MM to "Month YYYY"
function formatMonthYear(ym: string) {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  // Use a key per user for localStorage
  const userKey = user?.id || user?.email || "guest";
  const expensesKey = `smartspend-expenses-${userKey}`;
  const budgetsKey = `smartspend-budgets-${userKey}`;

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(expensesKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState<Omit<Expense, "id">>({
    description: "",
    amount: 0,
    category: categories[0],
    date: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState(getMonthYear(new Date().toISOString()));
  const [budgets, setBudgets] = useState<{ [month: string]: number }>(() => {
    const saved = localStorage.getItem(budgetsKey);
    return saved ? JSON.parse(saved) : {};
  });
  const [budgetInput, setBudgetInput] = useState<string>("");

  // --- Search & Filter State ---
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // --- Recurring Expenses State ---
  const [showRecurring, setShowRecurring] = useState(false);

  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("smartspend-darkmode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("smartspend-darkmode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // --- Motivational Quotes ---
  const quotes = [
    "Track your spending, grow your savings.",
    "Small savings today, big rewards tomorrow.",
    "A budget is telling your money where to go.",
    "Every peso counts. Make it count for you!",
    "Financial freedom starts with smart choices.",
    "Your future self will thank you for budgeting today.",
  ];
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    // eslint-disable-next-line
  }, [user?.name, user?.email]);

  useEffect(() => {
    localStorage.setItem(budgetsKey, JSON.stringify(budgets));
  }, [budgets, budgetsKey]);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(expensesKey, JSON.stringify(expenses));
  }, [expenses, expensesKey]);

  // When filterMonth changes, update the form date to the first day of that month
  useEffect(() => {
    // Only update if not editing (to avoid overwriting during edit)
    if (!editingId) {
      const [year, month] = filterMonth.split("-");
      // Set to first day of selected month
      setForm(f => ({
        ...f,
        date: `${year}-${month}-01`
      }));
    }
  }, [filterMonth, editingId]);

  // Add or update expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setExpenses(expenses.map(exp =>
        exp.id === editingId ? { ...exp, ...form, recurring: form.recurring } : exp
      ));
      setEditingId(null);
    } else {
      setExpenses([
        ...expenses,
        { ...form, id: Date.now().toString(), recurring: form.recurring || false }
      ]);
    }
    setForm({
      description: "",
      amount: 0,
      category: categories[0],
      date: new Date().toISOString().slice(0, 10),
      recurring: false,
    });
  };

  // Edit expense
  const handleEdit = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (exp) {
      setForm({ ...exp });
      setEditingId(id);
    }
  };

  // Delete expense
  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // --- Recurring Expenses Logic ---
  // Add recurring expenses for the new month if not already present
  useEffect(() => {
    // Only run when month changes
    const [year, month] = filterMonth.split("-");
    const recurringToAdd = expenses.filter(
      exp =>
        exp.recurring &&
        getMonthYear(exp.date) !== filterMonth &&
        !expenses.some(
          e =>
            e.recurring &&
            e.description === exp.description &&
            getMonthYear(e.date) === filterMonth
        )
    );
    if (recurringToAdd.length > 0) {
      const newRecs = recurringToAdd.map(exp => ({
        ...exp,
        id: Date.now().toString() + Math.random(),
        date: `${year}-${month}-01`,
      }));
      setExpenses(prev => [...prev, ...newRecs]);
    }
    // eslint-disable-next-line
  }, [filterMonth]);

  // --- Filtered Expenses Logic ---
  let filteredExpenses = expenses.filter(
    e => getMonthYear(e.date) === filterMonth
  );

  // Apply search and advanced filters
  filteredExpenses = filteredExpenses.filter(exp => {
    // Search by description or note
    const matchesSearch =
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.note && exp.note.toLowerCase().includes(search.toLowerCase()));
    // Category filter
    const matchesCategory =
      filterCategory === "All" || exp.category === filterCategory;
    // Amount range filter
    const amt = Number(exp.amount);
    const matchesMin = amountMin === "" || amt >= Number(amountMin);
    const matchesMax = amountMax === "" || amt <= Number(amountMax);
    // Date range filter
    const matchesDateFrom = !dateFrom || exp.date >= dateFrom;
    const matchesDateTo = !dateTo || exp.date <= dateTo;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesMin &&
      matchesMax &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Total summary for filtered month
  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Budget logic
  const monthBudget = budgets[filterMonth] || 0;
  const remainingBudget = monthBudget - total;

  // Handle budget input submit
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(budgetInput);
    if (!isNaN(value) && value >= 0) {
      setBudgets({ ...budgets, [filterMonth]: value });
      setBudgetInput("");
    }
  };

  // Monthly breakdown (group by month)
  const monthlyBreakdown = expenses.reduce((acc, e) => {
    const key = getMonthYear(e.date);
    acc[key] = (acc[key] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  // Pie chart data (by category)
  const pieData = categories.map(cat => ({
    name: cat,
    value: filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter(d => d.value > 0);

  // --- Update form state to support recurring ---
  useEffect(() => {
    // Only update if not editing (to avoid overwriting during edit)
    if (!editingId) {
      const [year, month] = filterMonth.split("-");
      setForm(f => ({
        ...f,
        date: `${year}-${month}-01`,
        recurring: false,
      }));
    }
  }, [filterMonth, editingId]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 flex flex-col transition-colors`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? "bg-gray-900/90" : "bg-white/90"} backdrop-blur-md rounded-xl shadow-md mb-8 px-6 py-4 flex justify-between items-center border-b-2 ${darkMode ? "border-gray-700" : "border-blue-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 ${darkMode ? "bg-gradient-to-r from-gray-700 to-gray-900" : "bg-gradient-to-r from-blue-600 to-purple-600"} rounded-full text-white shadow`}>
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r ${darkMode ? "from-yellow-200 to-yellow-400" : "from-blue-600 to-purple-600"} bg-clip-text text-transparent`}>
            Expense Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            className={`rounded-full p-2 transition ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={() => setDarkMode(d => !d)}
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-blue-700" />}
          </button>
          <button
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Personalized Greeting */}
      <div className="max-w-3xl mx-auto mb-6 w-full">
        <div className={`rounded-xl shadow-lg px-6 py-4 mb-2 flex flex-col items-start ${darkMode ? "bg-gray-800 text-yellow-100" : "bg-white/90 text-blue-900"}`}>
          <span className="text-xl font-bold mb-1">
            Hello{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ""}!
          </span>
          <span className={`italic text-base ${darkMode ? "text-yellow-300" : "text-blue-700"}`}>{quote}</span>
        </div>
      </div>

      {/* --- Search & Advanced Filters --- */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className={`rounded-xl shadow-lg p-4 flex flex-col md:flex-row md:items-end gap-4 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90 border-blue-100"}`}>
          <div className="flex-1">
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Search</label>
            <input
              type="text"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              placeholder="Search description or note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Category</label>
            <select
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Amount Min</label>
            <input
              type="number"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              value={amountMin}
              onChange={e => setAmountMin(e.target.value)}
              placeholder="Min"
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Amount Max</label>
            <input
              type="number"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              value={amountMax}
              onChange={e => setAmountMax(e.target.value)}
              placeholder="Max"
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Date From</label>
            <input
              type="date"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Date To</label>
            <input
              type="date"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-full`}
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-3xl mx-auto space-y-8 flex-1">
        {/* Budget Card */}
        <div className={`rounded-xl shadow-lg p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white/90 border border-blue-100"}`}>
          <form onSubmit={handleBudgetSubmit} className="flex items-center gap-2">
            <label className={`font-semibold ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Monthly Budget:</label>
            <input
              type="number"
              min={0}
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 w-32 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              placeholder="Set budget"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow transition font-semibold"
            >
              Set
            </button>
          </form>
          <div className="flex flex-col md:items-end">
            <span className={`font-bold text-lg ${darkMode ? "text-yellow-200" : "text-purple-700"}`}>
              Budget for {filterMonth}: ₱{monthBudget.toFixed(2)}
            </span>
            <span className={`font-semibold text-md ${remainingBudget < 0 ? "text-red-500" : darkMode ? "text-green-300" : "text-green-600"}`}>
              Remaining: ₱{remainingBudget.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className={`rounded-xl shadow-lg p-6 mb-4 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white/90 border border-blue-100"}`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <input
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              required
            />
            <select
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {categories.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <input
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
            <div className="flex items-center gap-2 mt-2 col-span-1 md:col-span-2">
              <input
                type="checkbox"
                id="recurring"
                checked={!!form.recurring}
                onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
              />
              <label htmlFor="recurring" className={`text-sm font-medium ${darkMode ? "text-yellow-200" : "text-gray-700"}`}>
                Recurring (add automatically every month)
              </label>
            </div>
            <button
              className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold transition"
              type="submit"
            >
              {editingId ? "Update" : "Add"} Expense
            </button>
          </form>
        </div>

        {/* Filter and Total */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <label className={`mr-2 font-semibold ${darkMode ? "text-yellow-200" : "text-blue-900"}`}>Filter by month:</label>
            <input
              type="month"
              className={`border ${darkMode ? "border-gray-600 bg-gray-900 text-yellow-100" : "border-gray-300 bg-white text-blue-900"} rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            />
          </div>
          <div className={`font-bold text-lg ${darkMode ? "text-yellow-200" : "text-purple-700"}`}>
            Total: ₱{total.toFixed(2)}
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart Card */}
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white/90 border border-blue-100"} flex flex-col items-center`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-yellow-200" : "text-gray-800"}`}>Spending by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ₱${value.toFixed(2)}` : ""
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    background: darkMode ? "#222" : "#fff",
                    color: darkMode ? "#ffe066" : "#222",
                  }}
                  formatter={(value: number) => `₱${value.toFixed(2)}`}
                />
                <Legend
                  wrapperStyle={{
                    color: darkMode ? "#ffe066" : "#222",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Breakdown Card */}
          <div className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white/90 border border-blue-100"}`}>
            <h2 className={`font-bold mb-4 ${darkMode ? "text-yellow-200" : "text-gray-800"}`}>Monthly Breakdown</h2>
            <ul className="space-y-2">
              {Object.entries(monthlyBreakdown).map(([month, amt]) => (
                <li key={month} className="flex justify-between items-center">
                  <span className={darkMode ? "text-yellow-100" : "text-gray-700"}>{formatMonthYear(month)}</span>
                  <span className={`font-semibold ${darkMode ? "text-blue-300" : "text-blue-700"}`}>₱{amt.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expenses Table Card */}
        <div className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white/90 border border-blue-100"}`}>
          <h2 className={`font-bold mb-4 ${darkMode ? "text-yellow-200" : "text-gray-800"}`}>Expenses</h2>
          <div className="overflow-x-auto">
            <table className={`w-full border rounded-lg overflow-hidden text-base ${darkMode ? "text-yellow-100" : "text-blue-900"}`}>
              <thead>
                <tr className={`${darkMode ? "bg-gray-700" : "bg-gradient-to-r from-blue-100 to-purple-100"}`}>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"} transition`}>
                    <td className="border p-2">{exp.description}</td>
                    <td className="border p-2">₱{Number(exp.amount).toFixed(2)}</td>
                    <td className="border p-2">{exp.category}</td>
                    <td className="border p-2">{exp.date}</td>
                    <td className="border p-2">
                      <button
                        className={`mr-2 font-semibold ${darkMode ? "text-blue-300 hover:underline" : "text-blue-600 hover:underline"}`}
                        onClick={() => handleEdit(exp.id)}
                      >
                        Edit
                      </button>
                      <button
                        className={`font-semibold ${darkMode ? "text-red-400 hover:underline" : "text-red-600 hover:underline"}`}
                        onClick={() => handleDelete(exp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td className="border p-2 text-center text-gray-500" colSpan={5}>
                      No expenses for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Enhanced Footer */}
      <footer className={`mt-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-center ${darkMode ? "text-yellow-100" : "text-white"}`}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
            </svg>
            <span>Contact me on</span>
            <a
              href="https://www.facebook.com/share/1BeNm43k1s/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-blue-200 transition"
            >
              Facebook
            </a>
          </span>
          <span className="hidden md:inline-block h-6 border-l border-white opacity-40"></span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.72 3.05a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.98.35 2 .59 3.05.72A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>or call/text:</span>
            <span className="font-semibold tracking-wider">0916 201 9871</span>
          </span>
        </div>
        <div className="mt-4 text-xs text-white/80">
          &copy; {new Date().getFullYear()} SmartSpend. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
