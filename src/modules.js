export const MODULES = [
  {
    id: "partners",
    title: "거래처 등록",
    description: "운송 업무와 계약을 함께 처리하는 거래처 기본 정보를 등록합니다.",
    icon: "01",
    fields: [
      { name: "companyName", label: "거래처명", type: "text", required: true },
      { name: "businessNumber", label: "사업자등록번호", type: "text", required: true },
      { name: "managerName", label: "담당자", type: "text", required: true },
      { name: "phone", label: "연락처", type: "tel", required: true },
      { name: "email", label: "이메일", type: "email" },
      { name: "address", label: "주소", type: "textarea" },
      { name: "memo", label: "메모", type: "textarea" }
    ]
  },
  {
    id: "centers",
    title: "센터 등록",
    description: "상하차, 배차, 보관 업무가 이루어지는 센터 정보를 관리합니다.",
    icon: "02",
    fields: [
      { name: "centerName", label: "센터명", type: "text", required: true },
      { name: "centerCode", label: "센터 코드", type: "text", required: true },
      { name: "centerType", label: "센터 유형", type: "select", required: true, options: ["허브", "물류센터", "영업소", "차고지"] },
      { name: "managerName", label: "센터 담당자", type: "text", required: true },
      { name: "phone", label: "연락처", type: "tel", required: true },
      { name: "address", label: "센터 주소", type: "textarea", required: true },
      { name: "operationHours", label: "운영 시간", type: "text" }
    ]
  },
  {
    id: "owners",
    title: "사업주 등록",
    description: "차량 소유 또는 위수탁 계약을 보유한 사업주 정보를 등록합니다.",
    icon: "03",
    fields: [
      { name: "ownerName", label: "사업주명", type: "text", required: true },
      { name: "businessNumber", label: "사업자등록번호", type: "text", required: true },
      { name: "representativeName", label: "대표자명", type: "text", required: true },
      { name: "phone", label: "연락처", type: "tel", required: true },
      { name: "bankAccount", label: "정산 계좌", type: "text" },
      { name: "address", label: "주소", type: "textarea" }
    ]
  },
  {
    id: "drivers",
    title: "운전자 등록",
    description: "운행 배정과 자격 확인에 필요한 운전자 정보를 관리합니다.",
    icon: "04",
    fields: [
      { name: "driverName", label: "운전자명", type: "text", required: true },
      { name: "phone", label: "연락처", type: "tel", required: true },
      { name: "licenseNumber", label: "운전면허번호", type: "text", required: true },
      { name: "licenseType", label: "면허 유형", type: "select", required: true, options: ["1종 대형", "1종 보통", "2종 보통", "특수"] },
      { name: "employmentType", label: "고용 형태", type: "select", options: ["정규", "계약", "지입", "협력"] },
      { name: "emergencyContact", label: "비상 연락처", type: "tel" }
    ]
  },
  {
    id: "vehicles",
    title: "차량 등록",
    description: "차량번호, 소유자, 운행 상태 등 차량 기본 정보를 등록합니다.",
    icon: "05",
    fields: [
      { name: "vehicleNumber", label: "차량번호", type: "text", required: true },
      { name: "vin", label: "차대번호", type: "text", required: true },
      { name: "vehicleType", label: "차량 유형", type: "select", required: true, options: ["카고", "윙바디", "탑차", "냉동", "트레일러"] },
      { name: "ownerName", label: "소유 사업주", type: "text", required: true },
      { name: "status", label: "운행 상태", type: "select", required: true, options: ["운행 가능", "정비 중", "휴차", "매각"] },
      { name: "registrationDate", label: "등록일", type: "date" }
    ]
  },
  {
    id: "vehicle-specs",
    title: "차량 제원 등록",
    description: "적재 중량, 규격, 연료 등 차량 제원 정보를 차량번호 기준으로 등록합니다.",
    icon: "06",
    fields: [
      { name: "vehicleNumber", label: "차량번호", type: "text", required: true },
      { name: "payloadKg", label: "최대 적재 중량(kg)", type: "number", required: true, min: 0 },
      { name: "lengthMm", label: "길이(mm)", type: "number", min: 0 },
      { name: "widthMm", label: "너비(mm)", type: "number", min: 0 },
      { name: "heightMm", label: "높이(mm)", type: "number", min: 0 },
      { name: "fuelType", label: "연료", type: "select", options: ["경유", "전기", "수소", "LPG", "휘발유"] },
      { name: "temperatureControl", label: "온도 관리", type: "select", options: ["없음", "냉장", "냉동", "냉장/냉동"] }
    ]
  },
  {
    id: "vehicle-assignments",
    title: "차량 배정 등록",
    description: "센터, 운전자, 차량의 배정 기간과 운행 목적을 기록합니다.",
    icon: "07",
    fields: [
      { name: "vehicleNumber", label: "차량번호", type: "text", required: true },
      { name: "driverName", label: "운전자명", type: "text", required: true },
      { name: "centerName", label: "배정 센터", type: "text", required: true },
      { name: "startDate", label: "배정 시작일", type: "date", required: true },
      { name: "endDate", label: "배정 종료일", type: "date" },
      { name: "routeName", label: "운행 노선", type: "text" },
      { name: "memo", label: "배정 메모", type: "textarea" }
    ]
  },
  {
    id: "insurance",
    title: "보험 등록",
    description: "차량별 보험사, 증권번호, 보장 기간을 관리합니다.",
    icon: "08",
    fields: [
      { name: "vehicleNumber", label: "차량번호", type: "text", required: true },
      { name: "insurer", label: "보험사", type: "text", required: true },
      { name: "policyNumber", label: "증권번호", type: "text", required: true },
      { name: "coverageType", label: "보험 종류", type: "select", required: true, options: ["자동차 종합", "화물 공제", "적재물", "책임"] },
      { name: "startDate", label: "보험 시작일", type: "date", required: true },
      { name: "endDate", label: "보험 종료일", type: "date", required: true },
      { name: "premium", label: "보험료", type: "number", min: 0 }
    ]
  },
  {
    id: "inspections",
    title: "점검 등록",
    description: "정기검사, 안전점검, 정비 이력을 기록하고 다음 점검일을 관리합니다.",
    icon: "09",
    fields: [
      { name: "vehicleNumber", label: "차량번호", type: "text", required: true },
      { name: "inspectionType", label: "점검 유형", type: "select", required: true, options: ["정기검사", "안전점검", "정비", "수리"] },
      { name: "inspectionDate", label: "점검일", type: "date", required: true },
      { name: "nextInspectionDate", label: "다음 점검일", type: "date" },
      { name: "result", label: "점검 결과", type: "select", required: true, options: ["정상", "주의", "정비 필요", "운행 불가"] },
      { name: "inspector", label: "점검자", type: "text" },
      { name: "notes", label: "점검 내용", type: "textarea" }
    ]
  },
  {
    id: "contracts",
    title: "계약 등록",
    description: "거래처, 사업주, 운송 조건에 대한 계약 정보를 등록합니다.",
    icon: "10",
    fields: [
      { name: "contractName", label: "계약명", type: "text", required: true },
      { name: "partnerName", label: "거래처명", type: "text", required: true },
      { name: "ownerName", label: "사업주명", type: "text" },
      { name: "contractType", label: "계약 유형", type: "select", required: true, options: ["운송", "위수탁", "임대", "정비", "보험"] },
      { name: "startDate", label: "계약 시작일", type: "date", required: true },
      { name: "endDate", label: "계약 종료일", type: "date" },
      { name: "amount", label: "계약 금액", type: "number", min: 0 },
      { name: "terms", label: "주요 조건", type: "textarea" }
    ]
  },
  {
    id: "photos",
    title: "사진 업로드",
    description: "차량, 사고, 점검, 계약 관련 사진을 업로드하고 메모를 남깁니다.",
    icon: "11",
    fields: [
      { name: "photoTitle", label: "사진 제목", type: "text", required: true },
      { name: "category", label: "분류", type: "select", required: true, options: ["차량", "점검", "보험", "계약", "사고", "기타"] },
      { name: "relatedTarget", label: "연결 대상", type: "text", placeholder: "예: 12가3456 / 계약명" },
      { name: "takenDate", label: "촬영일", type: "date" },
      { name: "photoFile", label: "사진 파일", type: "file", accept: "image/*", required: true },
      { name: "memo", label: "메모", type: "textarea" }
    ]
  }
];

export function getModuleById(moduleId) {
  return MODULES.find((module) => module.id === moduleId);
}
