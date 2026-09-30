import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
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
      startDate: record.startDate.slice(0, 10),
      endDate: record.endDate.slice(0, 10),
    });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div>
      <PageHeader
        title="Academic Years"
        subtitle={loading ? "" : `${academicYears.length} record(s)`}
      >
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="input w-full sm:w-48"
          aria-label="Filter by department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.code}
            </option>
          ))}
        </select>
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Add Academic Year
        </button>
      </PageHeader>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : academicYears.length === 0 ? (
          <EmptyState
            title="No academic years found"
            text='Click "Add Academic Year" to create one.'
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Academic Year</th>
                  <th className="th">Semester</th>
                  <th className="th">Dept</th>
                  <th className="th hidden md:table-cell">Start</th>
                  <th className="th hidden md:table-cell">End</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-medium text-slate-900">
                        {record.academicYear}
                      </p>
                      {/* On phones the dates move under the year */}
                      <p className="mt-0.5 text-xs text-slate-500 md:hidden">
                        {formatDate(record.startDate)} to{" "}
                        {formatDate(record.endDate)}
                      </p>
                    </td>
                    <td className="td">
                      <span className="badge bg-slate-100 text-slate-700">
                        Sem {record.semester}
                      </span>
                    </td>
                    <td className="td">
                      <span className="badge bg-indigo-50 text-indigo-700">
                        {record.department.code}
                      </span>
                    </td>
                    <td className="td hidden md:table-cell">
                      {formatDate(record.startDate)}
                    </td>
                    <td className="td hidden md:table-cell">
                      {formatDate(record.endDate)}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(record)}
                          className="icon-btn hover:text-indigo-600"
                          aria-label="Edit academic year"
                          title="Edit"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete academic year"
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
          title={editing ? "Edit Academic Year" : "Add Academic Year"}
          onClose={() => setShowModal(false)}
        >
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
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

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="academicYear" className="label">
                  Academic year
                </label>
                <input
                  id="academicYear"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  placeholder="2026-27"
                  className="input"
                />
                {formErrors.academicYear && (
                  <p className="field-error">{formErrors.academicYear}</p>
                )}
              </div>
              <div>
                <label htmlFor="semester" className="label">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      Semester {n}
                    </option>
                  ))}
                </select>
                {formErrors.semester && (
                  <p className="field-error">{formErrors.semester}</p>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="label">
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="input"
                />
                {formErrors.startDate && (
                  <p className="field-error">{formErrors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="label">
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="input"
                />
                {formErrors.endDate && (
                  <p className="field-error">{formErrors.endDate}</p>
                )}
              </div>
            </div>

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

export default AcademicYears;