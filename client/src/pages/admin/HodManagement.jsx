import UserManagement from "../../components/UserManagement";
import { hodApi } from "../../services/userService";

function HodManagement() {
  return (
    <UserManagement
      role="hod"
      title="HOD Management"
      singular="HOD"
      api={hodApi}
      idLabel="HOD ID"
      idPlaceholder="e.g. ETC-HOD-001"
    />
  );
}

export default HodManagement;