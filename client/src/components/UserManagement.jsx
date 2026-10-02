import { useEffect, useState } from "react";
import Modal from "./Modal";
import Alert from "./Alert";
import Icon from "./Icon";
import PageHeader from "./PageHeader";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getDepartments, assignHod } from "../services/departmentService";

const emptyForm = {
  name: "",
  userId: "",
  email: "",
  department: "",
  password: "",
  status: "active",
};

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function UserManagement({ role, title, singular, api, idLabel, idPlaceholder }) {
  const isHod = role === "hod";

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters. "search" is the debounced copy of "searchInput".
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // Add / edit modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  // Wait 400 ms after the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load users + departments whenever a filter or refreshKey changes
  useEffect(() => {
    const load = async () => {
      try {
        const params = {};
        if (filterDept) params.department = filterDept;
        if (filterStatus) params.status = filterStatus;
        if (search) params.search = search;

        const [userData, deptData] = await Promise.all([
          api.list(params),
          getDepartments(),
        ]);
        setUsers(userData.users);
        setDepartments(deptData.departments);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, refreshKey, filterDept, filterStatus, search]);

  const reload = () => setRefreshKey((key) => key + 1);

  // Is this user currently the head of their department?
  const isDepartmentHod = (user) =>
    departments.some((d) => d.hod && d.hod._id === user._id);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      userId: user.userId,
      email: user.email || "",
      department: user.department?._id || "",
      password: "",
      status: user.status,
    });
    setFormErrors({});
    setFormError("");
    setShowForm(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!editing && form.userId.trim().length < 3)
      errors.userId = `${idLabel} must be at least 3 characters`;
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      errors.email = "Please enter a valid email";
    if (!form.department) errors.department = "Select a department";
    if (!editing && form.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      const payload = { name: form.name.trim(), department: form.department };
      if (form.email.trim()) payload.email = form.email.trim();

      let data;
      if (editing) {
        payload.status = form.status;
        data = await api.update(editing._id, payload);
      } else {
        payload.userId = form.userId.trim();
        payload.password = form.password;
        data = await api.create(payload);
      }

      setShowForm(false);
      setSuccess(data.message);
      setError("");
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${singular} "${user.name}" (${user.userId})?`)) return;

    try {
      const data = await api.remove(user._id);
      setSuccess(data.message);
      setError("");
      reload();
    } catch (err) {
      setSuccess("");
      setError(getErrorMessage(err));
    }
  };

  const openReset = (user) => {
    setResetTarget(user);
    setNewPassword("");
    setResetError("");
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }

    try {
      setResetting(true);
      const data = await api.resetPassword(resetTarget._id, newPassword);
      setResetTarget(null);
      setSuccess(`${data.message} for ${resetTarget.name}`);
      setError("");
    } catch (err) {
      setResetError(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  // HOD only: make this HOD the head of their department, or remove them
  const handleToggleHod = async (user) => {
    const makeHead = !isDepartmentHod(user);
    try {
      const data = await assignHod(user.department._id, makeHead ? user._id : null);
      setSuccess(data.message);
      setError("");
      reload();
    } catch (err) {
      setSuccess("");
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={loading ? "" : `${users.length} ${singular.toLowerCase()} account(s)`}
      >
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Add {singular}
        </button>
      </PageHeader>

      {/* Search and filters */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or ID"
            className="input pl-9"
            aria-label="Search"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="input"
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.code}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState
            title={`No ${singular.toLowerCase()} found`}
            text="Try changing the filters, or add a new account."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">{singular}</th>
                  <th className="th hidden sm:table-cell">Dept</th>
                  <th className="th hidden md:table-cell">Email</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const head = isHod && isDepartmentHod(user);
                  return (
                    <tr key={user._id} className="hover:bg-slate-50/70">
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {initialsOf(user.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.userId}
                              <span className="sm:hidden">
                                {" "}| {user.department?.code}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="td hidden sm:table-cell">
                        <span className="badge bg-indigo-50 text-indigo-700">
                          {user.department?.code}
                        </span>
                      </td>
                      <td className="td hidden md:table-cell">
                        {user.email || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="td">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`badge ${
                              user.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {user.status === "active" ? "Active" : "Inactive"}
                          </span>
                          {head && (
                            <span className="badge bg-amber-100 text-amber-700">
                              Dept HOD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="td">
                        <div className="flex justify-end gap-1">
                          {isHod && user.status === "active" && (
                            <button
                              onClick={() => handleToggleHod(user)}
                              className={`icon-btn ${
                                head
                                  ? "text-amber-500 hover:bg-amber-50"
                                  : "hover:text-amber-500"
                              }`}
                              aria-label={
                                head ? "Remove as department HOD" : "Set as department HOD"
                              }
                              title={
                                head ? "Remove as department HOD" : "Set as department HOD"
                              }
                            >
                              <Icon name="star" className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEdit(user)}
                            className="icon-btn hover:text-indigo-600"
                            aria-label={`Edit ${user.name}`}
                            title="Edit"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openReset(user)}
                            className="icon-btn hover:text-indigo-600"
                            aria-label={`Reset password for ${user.name}`}
                            title="Reset password"
                          >
                            <Icon name="key" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="icon-btn hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${user.name}`}
                            title="Delete"
                          >
                            <Icon name="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <Modal
          title={editing ? `Edit ${singular}` : `Add ${singular}`}
          onClose={() => setShowForm(false)}
        >
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Prof. Anita Sharma"
              className="input"
            />
            {formErrors.name && <p className="field-error">{formErrors.name}</p>}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="userId" className="label">
                  {idLabel}
                </label>
                <input
                  id="userId"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder={idPlaceholder}
                  disabled={Boolean(editing)}
                  className="input disabled:bg-slate-100 disabled:text-slate-500"
                />
                {formErrors.userId && (
                  <p className="field-error">{formErrors.userId}</p>
                )}
              </div>
              <div>
                <label htmlFor="department" className="label">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="field-error">{formErrors.department}</p>
                )}
              </div>
            </div>

            <label htmlFor="email" className="label mt-4">
              Email (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@college.edu"
              className="input"
            />
            {formErrors.email && <p className="field-error">{formErrors.email}</p>}

            {!editing && (
              <>
                <label htmlFor="password" className="label mt-4">
                  Initial password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="input"
                />
                {formErrors.password && (
                  <p className="field-error">{formErrors.password}</p>
                )}
              </>
            )}

            {editing && (
              <>
                <label htmlFor="status" className="label mt-4">
                  Account status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (cannot log in)</option>
                </select>
              </>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <Modal title="Reset password" onClose={() => setResetTarget(null)}>
          <p className="mb-4 text-sm text-slate-600">
            Set a new password for <strong>{resetTarget.name}</strong> (
            {resetTarget.userId}).
          </p>
          <Alert type="error" message={resetError} />
          <form onSubmit={handleReset} noValidate>
            <label htmlFor="newPassword" className="label">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="input"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={resetting} className="btn btn-primary">
                {resetting ? "Saving..." : "Reset password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default UserManagement;