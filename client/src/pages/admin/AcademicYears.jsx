import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getDepartments } from "../../services/departmentService";
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../../services/academicYearService";

const emptyForm = {
  department: "",
  academicYear: "",
  semester: "",
  startDate: "",
  endDate: "",
};

// Show a stored date as DD/MM/YYYY (UTC so the day never shifts)
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { timeZone: "UTC" });

function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterDept, setFilterDept] = useState(""); // "" = all departments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load academic years + departments (for the dropdowns)
  useEffect(() => {
    const load = async () => {
      try {
        const params = filterDept ? { department: filterDept } : {};
        const [yearData, deptData] = await Promise.all([
          getAcademicYears(params),
          getDepartments(),
        ]);
        setAcademicYears(yearData.academicYears);
        setDepartments(deptData.departments);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey, filterDept]);

  const reload = () => setRefreshKey((key) => key + 1);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      department: record.department._id,
      academicYear: record.academicYear,
      semester: String(record.semester),
      startDate: record.startDate.slice(0, 10), // "2026-07-01" for <input type="date">
      endDate: record.endDate.slice(0, 10),
    });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errors = {};
    if (!form.department) errors.department = "Select a department";
    if (!/^\d{4}-\d{2}$/.test(form.academicYear.trim()))
      errors.academicYear = "Use the format 2026-27";
    if (!form.semester) errors.semester = "Select a semester";
    if (!form.startDate) errors.startDate = "Start date is required";
    if (!form.endDate) errors.endDate = "End date is required";
    else if (form.startDate && form.endDate <= form.startDate)
      errors.endDate = "End date must be after start date";
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
      const payload = {
        department: form.department,
        academicYear: form.academicYear.trim(),
        semester: Number(form.semester),
        startDate: form.startDate,
        endDate: form.endDate,
      };
      const data = editing
        ? await updateAcademicYear(editing._id, payload)
        : await createAcademicYear(payload);

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

  const handleDelete = async (record) => {
    const label = `${record.academicYear}, Semester ${record.semester} (${record.department.code})`;
    if (!window.confirm(`Delete academic year ${label}?`)) return;

    try {
      const data = await deleteAcademicYear(record._id);
      setSuccess(data.message);
      setError("");
      reload();
    } catch (err) {
      setSuccess("");
      setError(getErrorMessage(err));
    }
  };

  const inputClass =
    "w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Academic Years</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code}
              </option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Academic Year
          </button>
        </div>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Academic Year</th>
              <th className="px-4 py-3">Semester</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && academicYears.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                  No academic years found.
                </td>
              </tr>
            )}

            {academicYears.map((record) => (
              <tr key={record._id} className="border-t">
                <td className="px-4 py-3 font-medium">{record.academicYear}</td>
                <td className="px-4 py-3">Semester {record.semester}</td>
                <td className="px-4 py-3">{record.department.code}</td>
                <td className="px-4 py-3">{formatDate(record.startDate)}</td>
                <td className="px-4 py-3">{formatDate(record.endDate)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(record)}
                    className="mr-3 text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record)}
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
          title={editing ? "Edit Academic Year" : "Add Academic Year"}
          onClose={() => setShowModal(false)}
        >
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {formErrors.department && (
              <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
            )}

            <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">
              Academic year
            </label>
            <input
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              placeholder="2026-27"
              className={inputClass}
            />
            {formErrors.academicYear && (
              <p className="mt-1 text-sm text-red-600">{formErrors.academicYear}</p>
            )}

            <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">
              Semester
            </label>
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  Semester {n}
                </option>
              ))}
            </select>
            {formErrors.semester && (
              <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Start date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className={inputClass}
                />
                {formErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  End date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className={inputClass}
                />
                {formErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                )}
              </div>
            </div>

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

export default AcademicYears;