// src/services/expenseService.ts

export interface Expense {
  _id?: string;
  description: string;
  amount: number;
  date: string; // or Date type if you prefer
}

export interface ExpenseAPI {
  id?: string;
  amount: number;
  category: string;
  date: string;
  note: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"; // adjust your URL

// ✅ Get all expenses for the logged-in user
export async function getExpenses(token: string): Promise<Expense[]> {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
}

// ✅ Add a new expense for the user
export async function addExpense(expense: Expense, token: string): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });

  if (!res.ok) throw new Error("Failed to add expense");
  return res.json();
}

// ✅ Update an existing expense
export async function updateExpense(expenseId: string, expense: Expense, token: string): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });

  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
}

// ✅ Delete an expense
export async function deleteExpense(expenseId: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete expense");
}

export const expenseService = {
  async getExpenses(): Promise<ExpenseAPI[]> {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("http://localhost:3001/api/expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    const data = await res.json();
    return data.expenses;
  },

  async createExpense(expense: Omit<ExpenseAPI, "id">): Promise<ExpenseAPI> {
    const token = localStorage.getItem("auth_token");
    const res = await fetch("http://localhost:3001/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to create expense");
    const data = await res.json();
    return data.expense;
  },

  async updateExpense(id: string, expense: ExpenseAPI): Promise<ExpenseAPI> {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`http://localhost:3001/api/expenses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to update expense");
    const data = await res.json();
    return data.expense;
  },

  async deleteExpense(id: string): Promise<void> {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`http://localhost:3001/api/expenses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete expense");
  },
};
