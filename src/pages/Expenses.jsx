import React, { useEffect, useState } from "react";
import {
  getExpenses,
  deleteExpense,
  createExpense,
  updateExpense,
} from "../api";
import Pagination from "../components/Pagination";
import ExpenseModal from "../components/ExpenseModal";
import { useAuth } from "../contexts/auth/useAuth";
import NoDataFound from "../components/NoDataFound";
import Loading from "../components/Loading";
import {
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiSelector,
} from "react-icons/hi";
import { useDialog } from "../contexts/dialog/useDialog";
import { Listbox } from "@headlessui/react";
import { formatDate } from "../utils/dateFormat";
import DatePicker from "../components/DatePicker";

const categoryStyles = {
  Rent: "bg-orange-100 text-orange-700",
  Utilities: "bg-cyan-100 text-cyan-700",
  Salary: "bg-emerald-100 text-emerald-700",
  Inventory: "bg-blue-100 text-blue-700",
  Marketing: "bg-purple-100 text-purple-700",
  Miscellaneous: "bg-pink-100 text-pink-700",
  Transport: "bg-cyan-100 text-cyan-700",
  Maintenance: "bg-emerald-100 text-emerald-700",
  Other: "bg-gray-100 text-gray-700",
};

function CategoryDropdown({ value, onChange }) {
  const categories = [
    "All Categories",
    "Rent",
    "Utilities",
    "Salary",
    "Inventory",
    "Marketing",
    "Miscellaneous",
    "Transport",
    "Maintenance",
    "Other",
  ];
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button className="cursor-pointer w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-left text-gray-800 text-sm flex items-center justify-between">
          <span>{value || "All Categories"}</span>
          <HiSelector className="w-5 h-5 text-gray-400 ml-2" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
          {categories.map((cat) => (
            <Listbox.Option
              key={cat}
              value={cat}
              className={({ selected }) =>
                `px-4 py-2 cursor-pointer text-black text-sm hover:bg-[#f1f5f9] ${selected ? "bg-blue-50" : ""}`
              }
            >
              {cat}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);

  // View Expense
  const [viewExpense, setViewExpense] = useState(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [updateExpense, setUpdateExpense] = useState(null);

  // Loading and Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog
  const dialog = useDialog();

  // Auth
  const { user } = useAuth();

  // Permissions
  const canView = user?.permission?.permissions?.includes("view_expense");
  const canCreate = user?.permission?.permissions?.includes("create_expense");
  const canUpdate = user?.permission?.permissions?.includes("update_expense");
  const canDelete = user?.permission?.permissions?.includes("delete_expense");

  // Filters
  const [category, setCategory] = useState("All Categories");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExpenses(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, startDate, endDate, search]);

  async function fetchExpenses(page = 1, limit = 10) {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit };
      if (category !== "All Categories") params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const res = await getExpenses(params);
      setExpenses(res.data.data);
      setPagination((prev) => ({
        ...prev,
        ...res.data.pagination,
        page,
        limit,
      }));
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  function handleView(expense) {
    setUpdateExpense(null);
    setViewExpense(expense);
    setModalOpen(true);
  }

  async function handleSave(expenseData) {
    setLoading(true);
    setError("");
    try {
      if (updateExpense) {
        await updateExpense(updateExpense._id, expenseData);
        dialog.success("Expense updated successfully");
      } else {
        await createExpense(expenseData);
        dialog.success("Expense added successfully");
      }
      fetchExpenses(1, pagination.limit);
      setModalOpen(false);
      setUpdateExpense(null);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to save expense";
      setError(msg);
      dialog.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await dialog.ask({
      type: "confirm",
      title: "Delete Expense",
      message: "Are you sure you want to delete this expense record?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirmed) {
      setLoading(true);
      try {
        await deleteExpense(id);
        await dialog.success("Expense deleted successfully");
        fetchExpenses(pagination.page, pagination.limit);
      } catch {
        dialog.error("Failed to delete expense");
      } finally {
        setLoading(false);
      }
    }
  }

  const handleReset = () => {
    setCategory("All Categories");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchExpenses(1, pagination.limit);
  };

  return (
    <div>
      <ExpenseModal
        key={modalOpen ? (updateExpense ? updateExpense._id : "new") : "closed"}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUpdateExpense(null);
          setViewExpense(null);
        }}
        onSave={handleSave}
        data={updateExpense || viewExpense}
        viewOnly={!!viewExpense}
      />
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Expense Tracking</h1>
          <span className="text-gray-500 text-sm">
            Manage your business expenses
          </span>
        </div>
        {canCreate && (
          <button
            className="bg-[#1e3a5f] hover:bg-[#16375b] text-white px-6 py-2 rounded-xl focus:outline-none flex items-center gap-2 cursor-pointer text-sm"
            onClick={() => {
              setViewExpense(null);
              setUpdateExpense(null);
              setModalOpen(true);
            }}
          >
            <HiOutlinePlus className="text-md" /> Add Expense
          </button>
        )}
      </div>
      <div className="bg-white rounded-2xl p-6 mb-3 border border-gray-100">
        <div className="w-full flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base mb-2 text-black">
            <HiOutlineFilter className="inline-block text-sm text-black" />
            <span>Filters</span>
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm mb-2 text-black cursor-pointer"
          >
            <HiOutlineRefresh className="inline-block text-sm text-black" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Search</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-gray-700 text-sm"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">From</label>
            <DatePicker
              selected={startDate}
              onChange={(date) =>
                setStartDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="Start Date"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">To</label>
            <DatePicker
              selected={endDate}
              onChange={(date) =>
                setEndDate(date ? date.toISOString().split("T")[0] : "")
              }
              placeholder="End Date"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm mb-1">Category</label>
            <CategoryDropdown value={category} onChange={setCategory} />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-x-auto border border-gray-100 px-3">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left text-sm align-middle">
            <thead>
              <tr>
                <th className="number">No.</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Receipt</th>
                {canView || canUpdate || canDelete ? (
                  <th className="action">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense._id}>
                  <td className="number">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </td>
                  <td>{expense.description}</td>
                  <td>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${categoryStyles[expense?.category] || "bg-gray-100 text-gray-700"}`}
                    >
                      {expense.category}
                    </span>
                  </td>

                  <td className="font-medium text-red-600">
                    -${Number(expense.amount).toFixed(2)}
                  </td>
                  <td>{formatDate(expense.date, true)}</td>
                  <td>
                    {expense.receipt_image ? (
                      <a
                        href={expense.receipt_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="flex items-center gap-1 justify-center action">
                    {canView && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="View"
                        onClick={() => handleView(expense)}
                      >
                        <HiOutlineEye className="text-xl" />
                      </button>
                    )}
                    {canUpdate && (
                      <button
                        className="text-[#1e3a5f] font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Update"
                        onClick={() => {
                          setViewExpense(null);
                          setUpdateExpense(expense);
                          setModalOpen(true);
                        }}
                      >
                        <HiOutlinePencil className="text-xl" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="text-red-500 font-semibold cursor-pointer p-2 rounded-full hover:bg-[#f1f5f9]"
                        title="Delete"
                        onClick={() => handleDelete(expense._id)}
                      >
                        <HiOutlineTrash className="text-xl" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <NoDataFound message="No expenses found." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {expenses.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            total={pagination.totalItems}
            page={pagination.page}
            limit={pagination.limit}
            onChange={({ page, limit }) => {
              setPagination((prev) => ({ ...prev, page, limit }));
              fetchExpenses(page, limit);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Expenses;
