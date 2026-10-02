import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import SubjectSelect from "../../components/SubjectSelect";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getSubjects } from "../../services/subjectService";
import {
  getSyllabus,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../services/syllabusService";

const emptyForm = {
  unitNumber: "1",
  unitTitle: "",
  chapterNumber: "1",
  chapterTitle: "",
  topic: "",
  plannedLectures: "1",
};

function SyllabusManagement() {
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  // data remembers WHICH subject it belongs to, so we can show a spinner while switching
  const [data, setData] = useState({ subjectId: "", topics: [] });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load the subject list once
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

  // Load the syllabus of the selected subject
  useEffect(() => {
    if (!subjectId) return;
    const load = async () => {
      try {
        const res = await getSyllabus(subjectId);
        setData({ subjectId, topics: res.topics });
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    load();
  }, [subjectId, refreshKey]);

  const reload = () => setRefreshKey((key) => key + 1);

  const topics = data.subjectId === subjectId ? data.topics : [];
  const loadingTopics = Boolean(subjectId) && data.subjectId !== subjectId && !error;
  const totalLectures = topics.reduce((sum, t) => sum + t.plannedLectures, 0);

  // Group the flat list into Unit -> Chapter -> Topics for display
  const units = [];
  for (const t of topics) {
    let unit = units.find((u) => u.unitNumber === t.unitNumber);
    if (!unit) {
      unit = { unitNumber: t.unitNumber, unitTitle: "", chapters: [] };
      units.push(unit);
    }
    if (!unit.unitTitle && t.unitTitle) unit.unitTitle = t.unitTitle;

    let chapter = unit.chapters.find((c) => c.chapterNumber === t.chapterNumber);
    if (!chapter) {
      chapter = { chapterNumber: t.chapterNumber, chapterTitle: t.chapterTitle, topics: [] };
      unit.chapters.push(chapter);
    }
    chapter.topics.push(t);
  }

  const openAdd = () => {
    setEditing(null);
    // Pre-fill with the last topic's unit/chapter to make data entry quicker
    const last = topics[topics.length - 1];
    setForm(
      last
        ? {
            ...emptyForm,
            unitNumber: String(last.unitNumber),
            unitTitle: last.unitTitle || "",
            chapterNumber: String(last.chapterNumber),
            chapterTitle: last.chapterTitle,
          }
        : emptyForm
    );
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      unitNumber: String(t.unitNumber),
      unitTitle: t.unitTitle || "",
      chapterNumber: String(t.chapterNumber),
      chapterTitle: t.chapterTitle,
      topic: t.topic,
      plannedLectures: String(t.plannedLectures),
    });
    setFormErrors({});
    setFormError("");
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errors = {};
    const wholeNumber = (value) => Number.isInteger(Number(value)) && value !== "";

    if (!wholeNumber(form.unitNumber) || Number(form.unitNumber) < 1)
      errors.unitNumber = "Enter a unit number (1 or more)";
    if (!wholeNumber(form.chapterNumber) || Number(form.chapterNumber) < 1)
      errors.chapterNumber = "Enter a chapter number (1 or more)";
    if (form.chapterTitle.trim().length < 2) errors.chapterTitle = "Chapter title is required";
    if (form.topic.trim().length < 2) errors.topic = "Topic is required";
    if (!wholeNumber(form.plannedLectures) || Number(form.plannedLectures) < 1 || Number(form.plannedLectures) > 20)
      errors.plannedLectures = "Planned lectures must be between 1 and 20";
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
        unitNumber: Number(form.unitNumber),
        unitTitle: form.unitTitle.trim(),
        chapterNumber: Number(form.chapterNumber),
        chapterTitle: form.chapterTitle.trim(),
        topic: form.topic.trim(),
        plannedLectures: Number(form.plannedLectures),
      };
      const res = editing
        ? await updateTopic(editing._id, payload)
        : await createTopic({ subject: subjectId, ...payload });

      setShowModal(false);
      setSuccess(res.message);
      setError("");
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete topic "${t.topic}"?`)) return;
    try {
      const res = await deleteTopic(t._id);
      setSuccess(res.message);
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
        title="Syllabus"
        subtitle={subjectId && !loadingTopics ? `${topics.length} topic(s), ${totalLectures} planned lecture(s)` : "Subject, Unit, Chapter, Topic"}
      >
        {subjectId && (
          <button onClick={openAdd} className="btn btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Add Topic
          </button>
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

      {!subjectId ? (
        <div className="card">
          <EmptyState title="Select a subject" text="Choose a subject above to view or build its syllabus." />
        </div>
      ) : loadingTopics ? (
        <div className="card"><Spinner /></div>
      ) : topics.length === 0 ? (
        <div className="card">
          <EmptyState title="No topics yet" text='Click "Add Topic" to start building this syllabus.' />
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((unit) => (
            <div key={unit.unitNumber} className="card overflow-hidden">
              <div className="border-b border-slate-200 bg-indigo-50 px-5 py-3">
                <h2 className="font-semibold text-indigo-900">
                  Unit {unit.unitNumber}
                  {unit.unitTitle && `: ${unit.unitTitle}`}
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {unit.chapters.map((chapter) => (
                  <div key={chapter.chapterNumber} className="px-5 py-4">
                    <h3 className="mb-2 text-sm font-semibold text-slate-800">
                      Chapter {chapter.chapterNumber}: {chapter.chapterTitle}
                    </h3>
                    <ul className="space-y-1">
                      {chapter.topics.map((t) => (
                        <li
                          key={t._id}
                          className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                        >
                          <span className="text-sm text-slate-700">{t.topic}</span>
                          <span className="flex shrink-0 items-center gap-1">
                            <span className="badge bg-slate-100 text-slate-700">
                              {t.plannedLectures} lecture{t.plannedLectures > 1 ? "s" : ""}
                            </span>
                            <button
                              onClick={() => openEdit(t)}
                              className="icon-btn hover:text-indigo-600"
                              aria-label={`Edit ${t.topic}`}
                              title="Edit"
                            >
                              <Icon name="edit" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t)}
                              className="icon-btn hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${t.topic}`}
                              title="Delete"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? "Edit Topic" : "Add Topic"} onClose={() => setShowModal(false)}>
          <Alert type="error" message={formError} />
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="unitNumber" className="label">Unit no.</label>
                <input id="unitNumber" name="unitNumber" type="number" min="1" value={form.unitNumber} onChange={handleChange} className="input" />
                {formErrors.unitNumber && <p className="field-error">{formErrors.unitNumber}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="unitTitle" className="label">Unit title (optional)</label>
                <input id="unitTitle" name="unitTitle" value={form.unitTitle} onChange={handleChange} placeholder="e.g. Introduction" className="input" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="chapterNumber" className="label">Chapter no.</label>
                <input id="chapterNumber" name="chapterNumber" type="number" min="1" value={form.chapterNumber} onChange={handleChange} className="input" />
                {formErrors.chapterNumber && <p className="field-error">{formErrors.chapterNumber}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="chapterTitle" className="label">Chapter title</label>
                <input id="chapterTitle" name="chapterTitle" value={form.chapterTitle} onChange={handleChange} placeholder="e.g. ER Model" className="input" />
                {formErrors.chapterTitle && <p className="field-error">{formErrors.chapterTitle}</p>}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="topic" className="label">Topic</label>
                <input id="topic" name="topic" value={form.topic} onChange={handleChange} placeholder="e.g. Entities and Attributes" className="input" />
                {formErrors.topic && <p className="field-error">{formErrors.topic}</p>}
              </div>
              <div>
                <label htmlFor="plannedLectures" className="label">Planned lectures</label>
                <input id="plannedLectures" name="plannedLectures" type="number" min="1" max="20" value={form.plannedLectures} onChange={handleChange} className="input" />
                {formErrors.plannedLectures && <p className="field-error">{formErrors.plannedLectures}</p>}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : editing ? "Update" : "Add topic"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default SyllabusManagement;