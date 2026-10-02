import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import SubjectSelect from "../../components/SubjectSelect";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDate } from "../../utils/formatDate";
import { getSubjects } from "../../services/subjectService";
import { getSyllabus } from "../../services/syllabusService";
import {
  getLecturePlans,
  createLecture,
  updateLecture,
  deleteLecture,
  generateLecturePlan,
  clearLecturePlan,
} from "../../services/lecturePlanService";

const emptyLecture = { lectureNumber: "", syllabus: "", plannedTopic: "", plannedDate: "" };

function LecturePlans() {
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [data, setData] = useState({ subjectId: "", lectures: [], topics: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Add / edit lecture modal
  const [showLecture, setShowLecture] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLecture);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Generate modal
  const [showGenerate, setShowGenerate] = useState(false);
  const [gen, setGen] = useState({ startDate: "", lecturesPerWeek: "3" });
  const [genError, setGenError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSubjects();
        setSubjects(res.subjects);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setSubjectsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    const load = async () => {
      try {
        const [planData, syllabusData] = await Promise.all([
          getLecturePlans(subjectId),
          getSyllabus(subjectId),
        ]);
        setData({ subjectId, lectures: planData.lectures, topics: syllabusData.topics });
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [subjectId, refreshKey]);

  const reload = () => setRefreshKey((key) => key + 1);

  const ready = data.subjectId === subjectId;
  const lectures = ready ? data.lectures : [];
  const topics = ready ? data.topics : [];
  const loadingData = Boolean(subjectId) && !ready && !error;
  const syllabusTotal = topics.reduce((sum, t) => sum + t.plannedLectures, 0);

  const topicLabel = (t) => `Unit ${t.unitNumber}, Ch ${t.chapterNumber}: ${t.topic}`;

  const openAdd = () => {
    setEditing(null);
    const nextNumber = lectures.length ? Math.max(...lectures.map((l) => l.lectureNumber)) + 1 : 1;
    setForm({ ...emptyLecture, lectureNumber: String(nextNumber) });
    setFormErrors({});
    setFormError("");
    setShowLecture(true);
  };

  const openEdit = (lecture) => {
    setEditing(lecture);
    setForm({
      lectureNumber: String(lecture.lectureNumber),
      syllabus: lecture.syllabus._id,
      plannedTopic: lecture.plannedTopic,
      plannedDate: lecture.plannedDate.slice(0, 10),
    });
    setFormErrors({});
    setFormError("");
    setShowLecture(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Choosing a syllabus topic pre-fills an empty "planned topic"
    if (name === "syllabus" && !form.plannedTopic) {
      const topic = topics.find((t) => t._id === value);
      setForm({ ...form, syllabus: value, plannedTopic: topic ? topic.topic : "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const errors = {};
    if (!Number.isInteger(Number(form.lectureNumber)) || Number(form.lectureNumber) < 1)
      errors.lectureNumber = "Enter a lecture number (1 or more)";
    if (!form.syllabus) errors.syllabus = "Select a syllabus topic";
    if (form.plannedTopic.trim().length < 2) errors.plannedTopic = "Planned topic is required";
    if (!form.plannedDate) errors.plannedDate = "Planned date is required";
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
        syllabus: form.syllabus,
        lectureNumber: Number(form.lectureNumber),
        plannedTopic: form.plannedTopic.trim(),
        plannedDate: form.plannedDate,
      };
      const res = editing
        ? await updateLecture(editing._id, payload)
        : await createLecture({ subject: subjectId, ...payload });

      setShowLecture(false);
      setSuccess(res.message);
      setError("");
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lecture) => {
    if (!window.confirm(`Delete lecture ${lecture.lectureNumber}?`)) return;
    try {
      const res = await deleteLecture(lecture._id);
      setSuccess(res.message);
      setError("");
      reload();
    } catch (err) {
      setSuccess("");
      setError(getErrorMessage(err));
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Remove ALL lectures of this subject's plan?")) return;
    try {
      const res = await clearLecturePlan(subjectId);
      setSuccess(res.message);
      setError("");
      reload();
    } catch (err) {
      setSuccess("");
      setError(getErrorMessage(err));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenError("");

    if (!gen.startDate) {
      setGenError("Choose the date of the first lecture");
      return;
    }
    const perWeek = Number(gen.lecturesPerWeek);
    if (!Number.isInteger(perWeek) || perWeek < 1 || perWeek > 6) {
      setGenError("Lectures per week must be between 1 and 6");
      return;
    }

    try {
      setGenerating(true);
      const res = await generateLecturePlan({
        subject: subjectId,
        startDate: gen.startDate,
        lecturesPerWeek: perWeek,
      });
      setShowGenerate(false);
      setSuccess(res.message);
      setError("");
      reload();
    } catch (err) {
      setGenError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Lecture Plans"
        subtitle={
          subjectId && !loadingData
            ? `${lectures.length} lecture(s) scheduled | syllabus plans ${syllabusTotal}`
            : "Lecture-wise teaching plan"
        }
      >
        {subjectId && !loadingData && (
          <>
            {lectures.length === 0 ? (
              <button onClick={() => { setGenError(""); setShowGenerate(true); }} className="btn btn-secondary">
                <Icon name="zap" className="h-4 w-4" />
                Generate from syllabus
              </button>
            ) : (
              <button onClick={handleClear} className="btn btn-secondary text-red-600">
                Clear plan
              </button>
            )}
            <button onClick={openAdd} className="btn btn-primary">
              <Icon name="plus" className="h-4 w-4" />
              Add Lecture
            </button>
          </>
        )}
      </PageHeader>

      <div className="mb-4 max-w-xl">
        {subjectsLoading ? (
          <p className="text-sm text-slate-500">Loading subjects...</p>
        ) : (
          <SubjectSelect subjects={subjects} value={subjectId} onChange={setSubjectId} />
        )}
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      {subjectId && !loadingData && lectures.length > 0 && lectures.length !== syllabusTotal && (
        <Alert
          type="error"
          message={`The syllabus plans ${syllabusTotal} lecture(s) but ${lectures.length} are scheduled. Progress is calculated from the scheduled lectures.`}
        />
      )}

      <div className="card overflow-hidden">
        {!subjectId ? (
          <EmptyState title="Select a subject" text="Choose a subject above to manage its lecture plan." />
        ) : loadingData ? (
          <Spinner />
        ) : lectures.length === 0 ? (
          <EmptyState
            title="No lectures planned"
            text={
              topics.length === 0
                ? "Add syllabus topics first, then generate the plan here."
                : 'Click "Generate from syllabus" to create the lectures automatically.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">#</th>
                  <th className="th">Planned topic</th>
                  <th className="th hidden md:table-cell">Unit / Chapter</th>
                  <th className="th">Date</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lectures.map((lecture) => (
                  <tr key={lecture._id} className="hover:bg-slate-50/70">
                    <td className="td font-medium text-slate-900">{lecture.lectureNumber}</td>
                    <td className="td">
                      <p className="text-slate-900">{lecture.plannedTopic}</p>
                      <p className="text-xs text-slate-500 md:hidden">
                        Unit {lecture.syllabus.unitNumber}, Ch {lecture.syllabus.chapterNumber}
                      </p>
                    </td>
                    <td className="td hidden md:table-cell">
                      Unit {lecture.syllabus.unitNumber} / Ch {lecture.syllabus.chapterNumber}
                      <span className="text-slate-400"> ({lecture.syllabus.chapterTitle})</span>
                    </td>
                    <td className="td whitespace-nowrap">{formatDate(lecture.plannedDate)}</td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(lecture)}
                          className="icon-btn hover:text-indigo-600"
                          aria-label={`Edit lecture ${lecture.lectureNumber}`}
                          title="Edit"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lecture)}
                          className="icon-btn hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete lecture ${lecture.lectureNumber}`}
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

      {/* Add / edit lecture */}
      {showLecture && (
        <Modal title={editing ? "Edit Lecture" : "Add Lecture"} onClose={() => setShowLecture(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="lectureNumber" className="label">Lecture no.</label>
                <input id="lectureNumber" name="lectureNumber" type="number" min="1" value={form.lectureNumber} onChange={handleChange} className="input" />
                {formErrors.lectureNumber && <p className="field-error">{formErrors.lectureNumber}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="plannedDate" className="label">Planned date</label>
                <input id="plannedDate" name="plannedDate" type="date" value={form.plannedDate} onChange={handleChange} className="input" />
                {formErrors.plannedDate && <p className="field-error">{formErrors.plannedDate}</p>}
              </div>
            </div>

            <label htmlFor="syllabus" className="label mt-4">Syllabus topic</label>
            <select id="syllabus" name="syllabus" value={form.syllabus} onChange={handleChange} className="input">
              <option value="">Select topic</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {topicLabel(t)}
                </option>
              ))}
            </select>
            {formErrors.syllabus && <p className="field-error">{formErrors.syllabus}</p>}

            <label htmlFor="plannedTopic" className="label mt-4">Planned topic for this lecture</label>
            <input id="plannedTopic" name="plannedTopic" value={form.plannedTopic} onChange={handleChange} placeholder="e.g. Entities and Attributes" className="input" />
            {formErrors.plannedTopic && <p className="field-error">{formErrors.plannedTopic}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowLecture(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : editing ? "Update" : "Add lecture"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Generate plan */}
      {showGenerate && (
        <Modal title="Generate lecture plan" onClose={() => setShowGenerate(false)}>
          <p className="mb-4 text-sm text-slate-600">
            Creates {syllabusTotal} numbered lecture(s) from the syllabus, in order, with planned
            dates spread over each week. You can edit any lecture afterwards.
          </p>
          <Alert type="error" message={genError} />
          <form onSubmit={handleGenerate} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="label">First lecture date</label>
                <input
                  id="startDate"
                  type="date"
                  value={gen.startDate}
                  onChange={(e) => setGen({ ...gen, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="perWeek" className="label">Lectures per week</label>
                <input
                  id="perWeek"
                  type="number"
                  min="1"
                  max="6"
                  value={gen.lecturesPerWeek}
                  onChange={(e) => setGen({ ...gen, lecturesPerWeek: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowGenerate(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={generating} className="btn btn-primary">
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default LecturePlans;