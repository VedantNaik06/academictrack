import UserManagement from "../../components/UserManagement";
import { facultyApi } from "../../services/userService";

function FacultyManagement() {
  return (
    <UserManagement
      role="faculty"
      title="Faculty Management"
      singular="Faculty"
      api={facultyApi}
      idLabel="Faculty ID"
      idPlaceholder="e.g. CSE-FAC-002"
    />
  );
}

export default FacultyManagement;