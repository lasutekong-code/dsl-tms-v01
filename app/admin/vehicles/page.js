import RoleProtectedPage from "../../components/RoleProtectedPage";

export default function AdminVehiclesPage() {
  return (
    <RoleProtectedPage
      allowedRoles={["admin"]}
      description="관리자 권한으로 차량 관리 화면에 접근했습니다."
      title="차량 관리"
    />
  );
}
