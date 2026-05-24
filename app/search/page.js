import RoleProtectedPage from "../components/RoleProtectedPage";
import { SEARCH_ROLES } from "../../lib/roleDestinations";

export default function SearchPage() {
  return (
    <RoleProtectedPage
      allowedRoles={SEARCH_ROLES}
      description="배차와 차량 정보를 검색하는 화면입니다."
      title="검색"
    />
  );
}
