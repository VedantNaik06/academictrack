import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
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
  const [editing, setEditing] = useState(null); // null = adding
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errors = {};
    if (form.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (form.code.trim().length < 2)
      errors.code = "Code must be at least 2 characters";
    else if (form.code.trim().length > 10)
      errors.code = "Code cannot exceed 10 characters";
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
      <PageHeader
        title="Departments"
        subtitle={loading ? "" : `${departments.length} department(s)`}
      >
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Add Department
        </button>
      </PageHeader>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : departments.length === 0 ? (
          <EmptyState
            title="No departments yet"
            text='Click "Add Department" to create the first one.'
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Department</th>
                  <th className="th">Code</th>
                  <th className="th hidden sm:table-cell">HOD</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((department) => (
                  <tr key={department._id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-medium text-slate-900">
                        {department.name}
                      </p>
                      {/* On phones the HOD moves under the name */}
                      <p className="mt-0.5 text-xs text-slate-500 sm:hidden">
                        HOD:{" "}
                        {department.hod ? department.hod.name : "Not assigned"}
                      </p>
                    </td>
                    <td className="td">
                      <span className="badge bg-indigo-50 text-indigo-700">
                        {department.code}
                      </span>
                    </td>
                    <td className="td hidden sm:table-cell">
                      {department.hod ? (
                        <>
                          {department.hod.name}{" "}
                          <span className="text-slate-400">
                            ({department.hod.userId})
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(department)}
                          className="icon-btn hover:text-indigo-600"
                          aria-label={`Edit ${department.name}`}
                          title="Edit"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(department)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${department.name}`}
                          title="Delete"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editing ? "Edit Department" : "Add Department"}
          onClose={() => setShowModal(false)}
        >
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="name" className="label">
              Department name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Electronics and Telecommunication"
              className="input"
            />
            {formErrors.name && <p className="field-error">{formErrors.name}</p>}

            <label htmlFor="code" className="label mt-4">
              Department code
            </label>
            <input
              id="code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. E&TC"
              className="input"
            />
            {formErrors.code && <p className="field-error">{formErrors.code}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
    </div>
  );
}

export default Departments;