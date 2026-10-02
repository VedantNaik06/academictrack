import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getSubjects } from "../../services/subjectService";
import { facultyApi } from "../../services/userService";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
} from "../../services/assignmentService";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: "", faculty: "" });
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentData, subjectData, facultyData] = await Promise.all([
          getAssignments(),
          getSubjects(),
          facultyApi.list({ status: "active" }),
        ]);
        setAssignments(assignmentData.assignments);
        setSubjects(subjectData.subjects);
        setFaculty(facultyData.users);
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

  // Only subjects without a faculty can be assigned
  const unassignedSubjects = subjects.filter((s) => !s.faculty);
  const selectedSubject = subjects.find((s) => s._id === form.subject);
  // Faculty of the same department as the chosen subject
  const facultyOptions = selectedSubject
    ? faculty.filter((f) => f.department?._id === selectedSubject.department._id)
    : [];

  const openAdd = () => {
    setForm({ subject: "", faculty: "" });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = {};
    if (!form.subject) errors.subject = "Select a subject";
    if (!form.faculty) errors.faculty = "Select a faculty member";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setSaving(true);
      const data = await createAssignment(form);
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

  const handleDelete = async (assignment) => {
    const label = `${assignment.faculty.name} from ${assignment.subject.subjectName}`;
    if (!window.confirm(`Unassign ${label}?`)) return;
    try {
      const data = await deleteAssignment(assignment._id);
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
        title="Faculty Assignments"
        subtitle={loading ? "" : `${assignments.length} assignment(s), ${unassignedSubjects.length} subject(s) unassigned`}
      >
        <button onClick={openAdd} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          Assign Faculty
        </button>
      </PageHeader>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            text='Create subjects and faculty first, then click "Assign Faculty".'
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">Subject</th>
                  <th className="th">Faculty</th>
                  <th className="th hidden sm:table-cell">Dept</th>
                  <th className="th hidden md:table-cell">Year / Sem</th>
                  <th className="th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/70">
                    <td className="td">
                      <p className="font-medium text-slate-900">{a.subject.subjectName}</p>
                      <p className="text-xs text-slate-500">{a.subject.subjectCode}</p>
                    </td>
                    <td className="td">
                      <p className="text-slate-900">{a.faculty.name}</p>
                      <p className="text-xs text-slate-500">{a.faculty.userId}</p>
                    </td>
                    <td className="td hidden sm:table-cell">
                      <span className="badge bg-indigo-50 text-indigo-700">{a.department.code}</span>
                    </td>
                    <td className="td hidden md:table-cell">
                      {a.academicYear.academicYear} / Sem {a.academicYear.semester}
                    </td>
                    <td className="td">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(a)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          aria-label="Unassign"
                          title="Unassign"
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
        <Modal title="Assign Faculty to Subject" onClose={() => setShowModal(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="subject" className="label">Subject (unassigned only)</label>
            <select
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ subject: e.target.value, faculty: "" })}
              className="input"
            >
              <option value="">
                {unassignedSubjects.length ? "Select subject" : "All subjects are assigned"}
              </option>
              {unassignedSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} - {s.subjectName} ({s.department.code}, Sem {s.semester})
                </option>
              ))}
            </select>
            {formErrors.subject && <p className="field-error">{formErrors.subject}</p>}

            <label htmlFor="faculty" className="label mt-4">Faculty (same department)</label>
            <select
              id="faculty"
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
              disabled={!form.subject}
              className="input disabled:bg-slate-100"
            >
              <option value="">
                {form.subject ? "Select faculty" : "Select a subject first"}
              </option>
              {facultyOptions.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.userId})
                </option>
              ))}
            </select>
            {formErrors.faculty && <p className="field-error">{formErrors.faculty}</p>}
            {form.subject && facultyOptions.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">
                No active faculty in this department yet. Add one on the Faculty page.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : "Assign"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Assignments;