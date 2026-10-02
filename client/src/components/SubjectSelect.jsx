function SubjectSelect({ subjects, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
      aria-label="Select subject"
    >
      <option value="">Select a subject</option>
      {subjects.map((s) => (
        <option key={s._id} value={s._id}>
          {s.subjectCode} - {s.subjectName} ({s.department.code}, Sem {s.semester},{" "}
          {s.academicYear.academicYear})
        </option>
      ))}
    </select>
  );
}

export default SubjectSelect;