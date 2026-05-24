export type Vehicle = {
  id: string;
  clientName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  driverLicense: string;
  driverAddress: string;
  driverPhotoLabel: string;
  centerName: string;
  managerName: string;
  managerPhone: string;
  vehicleModel: string;
  vehicleType: string;
  manufactureYear: string;
  registrationDate: string;
  fuelType: string;
  mileage: string;
  photos: {
    front: string;
    rear: string;
    side: string;
  };
  specifications: {
    length: string;
    width: string;
    height: string;
    payload: string;
    specialEquipment: string;
    options: string;
  };
  insurance: {
    company: string;
    policyNumber: string;
    period: string;
    inspectionDue: string;
    lastInspection: string;
  };
  contract: {
    contractNumber: string;
    ownerName: string;
    businessNumber: string;
    taxType: string;
    memo: string;
  };
};

export const vehicles: Vehicle[] = [
  {
    id: "veh-001",
    clientName: "한빛물류",
    vehicleNumber: "서울 82바 4591",
    driverName: "김도현",
    driverPhone: "010-2481-5190",
    driverEmail: "dohyun.kim@example.com",
    driverLicense: "1종 보통 / 2028-03-12 만료",
    driverAddress: "서울특별시 송파구 문정동",
    driverPhotoLabel: "김도현 기사",
    centerName: "수도권 동부센터",
    managerName: "박서연",
    managerPhone: "02-3412-7788",
    vehicleModel: "Hyundai Porter II",
    vehicleType: "1톤 냉동탑차",
    manufactureYear: "2022",
    registrationDate: "2022-06-15",
    fuelType: "디젤",
    mileage: "48,120 km",
    photos: {
      front: "전면",
      rear: "후면",
      side: "측면",
    },
    specifications: {
      length: "5,175 mm",
      width: "1,740 mm",
      height: "2,430 mm",
      payload: "1,000 kg",
      specialEquipment: "냉동기, 온도기록계",
      options: "후방카메라, 블랙박스, 하이패스",
    },
    insurance: {
      company: "삼성화재",
      policyNumber: "SF-2024-891204",
      period: "2025-01-01 ~ 2025-12-31",
      inspectionDue: "2026-06-14",
      lastInspection: "2024-06-10",
    },
    contract: {
      contractNumber: "CT-2024-0001",
      ownerName: "김도현",
      businessNumber: "123-45-67890",
      taxType: "일반과세",
      memo: "새벽 배송 고정 배차. 냉동 온도 유지 확인 필요.",
    },
  },
  {
    id: "veh-002",
    clientName: "푸른식자재",
    vehicleNumber: "경기 91아 7032",
    driverName: "이민준",
    driverPhone: "010-9384-2271",
    driverEmail: "minjun.lee@example.com",
    driverLicense: "1종 대형 / 2027-11-02 만료",
    driverAddress: "경기도 성남시 분당구 야탑동",
    driverPhotoLabel: "이민준 기사",
    centerName: "성남 식자재센터",
    managerName: "정하늘",
    managerPhone: "031-781-4452",
    vehicleModel: "Kia Bongo III",
    vehicleType: "1.2톤 윙바디",
    manufactureYear: "2021",
    registrationDate: "2021-09-03",
    fuelType: "디젤",
    mileage: "76,540 km",
    photos: {
      front: "전면",
      rear: "후면",
      side: "측면",
    },
    specifications: {
      length: "5,430 mm",
      width: "1,860 mm",
      height: "2,570 mm",
      payload: "1,200 kg",
      specialEquipment: "윙바디, 리프트 게이트",
      options: "내비게이션, 후방센서, 차선이탈경고",
    },
    insurance: {
      company: "DB손해보험",
      policyNumber: "DB-2024-118734",
      period: "2025-03-01 ~ 2026-02-28",
      inspectionDue: "2026-09-02",
      lastInspection: "2024-09-01",
    },
    contract: {
      contractNumber: "CT-2024-0016",
      ownerName: "이민준",
      businessNumber: "234-56-78901",
      taxType: "간이과세",
      memo: "식자재 상온 배송. 월말 운행 리포트 별도 전달.",
    },
  },
  {
    id: "veh-003",
    clientName: "정우전자",
    vehicleNumber: "인천 77사 1288",
    driverName: "최유진",
    driverPhone: "010-7441-9028",
    driverEmail: "yujin.choi@example.com",
    driverLicense: "1종 보통 / 2029-08-21 만료",
    driverAddress: "인천광역시 남동구 구월동",
    driverPhotoLabel: "최유진 기사",
    centerName: "인천 남동센터",
    managerName: "오지훈",
    managerPhone: "032-441-3209",
    vehicleModel: "Hyundai Mighty",
    vehicleType: "2.5톤 카고",
    manufactureYear: "2023",
    registrationDate: "2023-02-20",
    fuelType: "디젤",
    mileage: "31,840 km",
    photos: {
      front: "전면",
      rear: "후면",
      side: "측면",
    },
    specifications: {
      length: "6,225 mm",
      width: "2,025 mm",
      height: "2,350 mm",
      payload: "2,500 kg",
      specialEquipment: "전자제품 고정 레일",
      options: "어라운드뷰, 블랙박스, 적재함 커버",
    },
    insurance: {
      company: "현대해상",
      policyNumber: "HH-2025-442901",
      period: "2025-02-20 ~ 2026-02-19",
      inspectionDue: "2027-02-19",
      lastInspection: "2025-02-18",
    },
    contract: {
      contractNumber: "CT-2025-0007",
      ownerName: "최유진",
      businessNumber: "345-67-89012",
      taxType: "일반과세",
      memo: "고가 전자제품 운송. 상차 전 외관 사진 필수.",
    },
  },
];

export function getVehicleById(id: string) {
  return vehicles.find((vehicle) => vehicle.id === id);
}
