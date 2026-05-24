import assert from "node:assert/strict";
import test from "node:test";

import { MODULES, getModuleById } from "../src/modules.js";
import { addRecord, createTestStorage, deleteRecord, readRecords } from "../src/storage.js";

test("defines all requested registration modules", () => {
  assert.equal(MODULES.length, 11);
  assert.deepEqual(
    MODULES.map((module) => module.title),
    [
      "거래처 등록",
      "센터 등록",
      "사업주 등록",
      "운전자 등록",
      "차량 등록",
      "차량 제원 등록",
      "차량 배정 등록",
      "보험 등록",
      "점검 등록",
      "계약 등록",
      "사진 업로드"
    ]
  );
});

test("each module has at least one required field", () => {
  for (const module of MODULES) {
    assert.ok(
      module.fields.some((field) => field.required),
      `${module.title} must have required fields`
    );
  }
});

test("looks up modules by id", () => {
  assert.equal(getModuleById("vehicles")?.title, "차량 등록");
  assert.equal(getModuleById("missing"), undefined);
});

test("adds and deletes records in storage", () => {
  const storage = createTestStorage();

  const record = addRecord("partners", { companyName: "테스트 거래처" }, storage);
  assert.match(record.id, /^partners-/);
  assert.equal(readRecords("partners", storage).length, 1);
  assert.equal(readRecords("partners", storage)[0].companyName, "테스트 거래처");

  const nextRecords = deleteRecord("partners", record.id, storage);
  assert.equal(nextRecords.length, 0);
  assert.deepEqual(readRecords("partners", storage), []);
});

test("returns an empty array for invalid persisted data", () => {
  const storage = createTestStorage();
  storage.setItem("dsl-tms:drivers", "{invalid-json");

  assert.deepEqual(readRecords("drivers", storage), []);
});
