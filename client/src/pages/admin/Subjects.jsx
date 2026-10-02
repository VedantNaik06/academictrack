import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getDepartments } from "../../services/departmentService";
import { getAcademicYears } from "../../services/academicYearService";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../services/subjectService";

const emptyForm = { department: "", academicYear: "", subjectName: "", subjectCode: "" };

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [filterDept, setFilterDept] = useState("");
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
        const [subjectData, deptData, yearData] = await Promise.all([
          getSubjects(params),
          getDepartments(),
          getAcademicYears(),
        ]);
        setSubjects(subjectData.subjects);
        setDepartments(deptData.departments);
        setAcademicYears(yearData.academicYears);
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

  // Academic years of the department chosen in the form
  const yearsForForm = academicYears.filter((y) => y.department._id === form.department);
  const selectedYear = academicYears.find((y) => y._id === form.academicYear);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (subject) => {
    setEditing(subject);
    setForm({
      department: subject.department._id,
      academicYear: subject.academicYear._id,
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
    });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Changing the department clears the academic year (it belongs to one department)
    if (name === "department") setForm({ ...form, department: value, academicYear: "" });
    else setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const errors = {};
    if (!form.department) errors.department = "Select a department";
    if (!form.academicYear) errors.academicYear = "Select an academic year";
    if (form.subjectName.trim().length < 2) errors.subjectName = "Name must be at least 2 characters";
    if (form.subjectCode.trim().length < 2) errors.subjectCode = "Code must be at least 2 characters";
    else if (form.subjectCode.trim().length > 15) errors.subjectCode = "Code cannot exceed 15 characters";
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
        academicYear: form.academicYear,
        subjectName: form.subjectName.trim(),
        subjectCode: form.subjectCode.trim(),
      };
      const data = editing
        ? await updateSubject(editing._id, payload)
        : await createSubject(payload);

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

  const handleDelete = async (subject) => {
    if (!window.confirm(`Delete subject "${subject.subjectName}"?`)) return;
    try {
      const data = await deleteSubject(subject._id);
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
      <PageHeader title="Subjects" subtitle={loading ? "" : `${subjects.length} subject(s)`}>
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
          Add Subject
        </button>
      </PageHeader>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            text="Create an academic year first, then add the subjects of that semester."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Subject</th>
                  <th className="th hidden sm:table-cell">Dept</th>
                  <th className="th hidden md:table-cell">Year / Sem</th>
                  <th className="th hidden sm:table-cell">Faculty</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-medium text-slate-900">{subject.subjectName}</p>
                      <p className="text-xs text-slate-500">
                        {subject.subjectCode}
                        <span className="sm:hidden">
                          {" "}| {subject.department.code} | {subject.faculty ? subject.faculty.name : "Unassigned"}
                        </span>
                      </p>
                    </td>
                    <td className="td hidden sm:table-cell">
                      <span className="badge bg-indigo-50 text-indigo-700">
                        {subject.department.code}
                      </span>
                    </td>
                    <td className="td hidden md:table-cell">
                      {subject.academicYear.academicYear} / Sem {subject.semester}
                    </td>
                    <td className="td hidden sm:table-cell">
                      {subject.faculty ? (
                        subject.faculty.name
                      ) : (
                        <span className="badge bg-amber-100 text-amber-700">Unassigned</span>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(subject)}
                          className="icon-btn hover:text-indigo-600"
                          aria-label={`Edit ${subject.subjectName}`}
                          title="Edit"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${subject.subjectName}`}
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
        <Modal title={editing ? "Edit Subject" : "Add Subject"} onClose={() => setShowModal(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="department" className="label">Department</label>
            <select id="department" name="department" value={form.department} onChange={handleChange} className="input">
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {formErrors.department && <p className="field-error">{formErrors.department}</p>}

            <label htmlFor="academicYear" className="label mt-4">Academic year and semester</label>
            <select
              id="academicYear"
              name="academicYear"
              value={form.academicYear}
              onChange={handleChange}
              disabled={!form.department}
              className="input disabled:bg-slate-100"
            >
              <option value="">
                {form.department ? "Select academic year" : "Select a department first"}
              </option>
              {yearsForForm.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.academicYear} - Semester {y.semester}
                </option>
              ))}
            </select>
            {formErrors.academicYear && <p className="field-error">{formErrors.academicYear}</p>}
            {selectedYear && (
              <p className="mt-1 text-xs text-slate-500">
                The subject will be in Semester {selectedYear.semester}.
              </p>
            )}

            <label htmlFor="subjectName" className="label mt-4">Subject name</label>
            <input
              id="subjectName"
              name="subjectName"
              value={form.subjectName}
              onChange={handleChange}
              placeholder="e.g. Database Management System"
              className="input"
            />
            {formErrors.subjectName && <p className="field-error">{formErrors.subjectName}</p>}

            <label htmlFor="subjectCode" className="label mt-4">Subject code</label>
            <input
              id="subjectCode"
              name="subjectCode"
              value={form.subjectCode}
              onChange={handleChange}
              placeholder="e.g. DBMS"
              className="input"
            />
            {formErrors.subjectCode && <p className="field-error">{formErrors.subjectCode}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
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

export default Subjects;