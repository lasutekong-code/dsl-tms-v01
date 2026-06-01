import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeVehicleDetail } from "@/lib/vehicles/sanitize-detail";
import type { VehicleDetail } from "@/types/vehicle";

const baseDetail: VehicleDetail = {
  vehicle_id: "00000000-0000-4000-8000-000000000001",
  vehicle_no: "12가3456",
  car_name: "포터",
  registration_date: "2020-01-01",
  tonnage: 1,
  model_year: 2020,
  vin: "SECRET-VIN",
  vehicle_model_type: "카고",
  status: "active",
  special_equipment: null,
  height_mm: null,
  length_mm: null,
  width_mm: null,
  max_load_kg: null,
  driver_id: null,
  driver_name: "홍길동",
  birth_date: "1990-01-01",
  driver_phone: "01012345678",
  driver_license_no: "11-111111-11",
  cargo_license_no: "CARGO-1",
  owner_id: null,
  owner_name: "홍길동",
  owner_phone: "01099998888",
  owner_business_no: "123-45-67890",
  business_start_date: null,
  business_closed_date: null,
  vat_filing_enabled: true,
  service_fee_send_method: null,
  client_id: null,
  client_name: "테스트물류",
  center_id: null,
  center_name: null,
  contact_name: null,
  contact_phone: "0212345678",
  insurance_company: "테스트보험",
  insurance_rate: 0.9,
  insurance_renewal_date: null,
  latest_inspection_date: null,
  inspection_result: null,
  inspection_memo: null,
  consignment_contract_date: null,
  consignment_contract_end_date: null,
  service_contract_date: null,
  service_contract_end_date: null,
  shipper_cargo_contract_date: null,
  shipper_cargo_contract_end_date: null,
  home_address: "서울시 강남구",
  mailing_address: "서울시 서초구",
  vehicle_photos: [
    {
      id: "p1",
      photo_type: "front",
      storage_path: "vehicles/front.jpg",
      signed_url: "https://example.com/front",
    },
  ],
  driver_photo: {
    id: "d1",
    storage_path: "drivers/1.jpg",
    signed_url: "https://example.com/driver",
  },
  memos: [
    {
      id: "m1",
      memo_type: "공유",
      content: "shared memo",
      visibility: "shared",
      created_at: null,
    },
    {
      id: "m2",
      memo_type: "관리자",
      content: "admin memo",
      visibility: "admin_only",
      created_at: null,
    },
  ],
  can_view_sensitive: false,
};

test("client_manager receives masked phones and null sensitive fields", () => {
  const { detail } = sanitizeVehicleDetail(baseDetail, "client_manager", false);

  assert.equal(detail.birth_date, null);
  assert.equal(detail.vin, null);
  assert.equal(detail.insurance_rate, null);
  assert.equal(detail.home_address, null);
  assert.match(detail.driver_phone ?? "", /^\d{3}-\*\*\*\*-\d{4}$/);
  assert.equal(detail.memos.length, 1);
  assert.equal(detail.memos[0]?.visibility, "shared");
  assert.equal(detail.vehicle_photos[0]?.storage_path, null);
  assert.equal(detail.vehicle_photos[0]?.signed_url, "https://example.com/front");
});

test("admin keeps sensitive fields when allowed", () => {
  const { detail } = sanitizeVehicleDetail(baseDetail, "admin", true);

  assert.equal(detail.vin, "SECRET-VIN");
  assert.equal(detail.birth_date, "1990-01-01");
  assert.equal(detail.driver_phone, "01012345678");
  assert.equal(detail.memos.length, 2);
});

test("owner without sensitive permission gets masked phone", () => {
  const { detail } = sanitizeVehicleDetail(baseDetail, "owner", false);

  assert.equal(detail.vin, null);
  assert.match(detail.driver_phone ?? "", /\*\*\*\*/);
});
