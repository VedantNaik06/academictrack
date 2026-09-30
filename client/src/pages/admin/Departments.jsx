import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

const emptyForm = { name: "", code: "" };

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0); // change it to reload the list
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding, otherwise the department being edited
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load the list on first render and whenever refreshKey changes
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data.departments);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const reload = () => setRefreshKey((key) => key + 1);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (department) => {
    setEditing(department);
    setForm({ name: department.name, code: department.code });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Client-side validation (the server validates again)
  const validate = () => {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (form.code.trim().length < 2) errors.code = "Code must be at least 2 characters";
    else if (form.code.trim().length > 10) errors.code = "Code cannot exceed 10 characters";
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
      const payload = { name: form.name.trim(), code: form.code.trim() };
      const data = editing
        ? await updateDepartment(editing._id, payload)
        : await createDepartment(payload);

      setShowModal(false);
      setSuccess(data.message);
      setError("");
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete department "${department.name}"?`)) return;

    try {
      const data = await deleteDepartment(department._id);
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
        <button
          onClick={openAdd}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Department
        </button>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">HOD</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && departments.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                  No departments yet. Click "Add Department" to create one.
                </td>
              </tr>
            )}

            {departments.map((department) => (
              <tr key={department._id} className="border-t">
                <td className="px-4 py-3">{department.name}</td>
                <td className="px-4 py-3 font-medium">{department.code}</td>
                <td className="px-4 py-3">
                  {department.hod ? (
                    `${department.hod.name} (${department.hod.userId})`
                  ) : (
                    <span className="text-slate-400">Not assigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(department)}
                    className="mr-3 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(department)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editing ? "Edit Department" : "Add Department"}
          onClose={() => setShowModal(false)}
        >
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Department name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Electronics and Telecommunication"
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}

            <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">
              Department code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. E&TC"
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.code && (
              <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Departments;