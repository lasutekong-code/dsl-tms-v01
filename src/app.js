import { MODULES, getModuleById } from "./modules.js";
import { addRecord, deleteRecord, readRecords } from "./storage.js";

const state = {
  activeModuleId: MODULES[0].id
};

const navigation = document.querySelector("#moduleNavigation");
const form = document.querySelector("#registrationForm");
const formTitle = document.querySelector("#formTitle");
const formDescription = document.querySelector("#formDescription");
const formFields = document.querySelector("#formFields");
const listTitle = document.querySelector("#listTitle");
const recordsList = document.querySelector("#recordsList");
const totalCount = document.querySelector("#totalCount");
const activeModuleCount = document.querySelector("#activeModuleCount");
const photoPreview = document.querySelector("#photoPreview");
const notice = document.querySelector("#notice");

function formatDateTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getRequiredFields(module) {
  return module.fields.filter((field) => field.required);
}

function createField(field) {
  const wrapper = document.createElement("label");
  wrapper.className = "field";
  wrapper.htmlFor = field.name;

  const label = document.createElement("span");
  label.textContent = field.required ? `${field.label} *` : field.label;
  wrapper.append(label);

  let input;

  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 3;
  } else if (field.type === "select") {
    input = document.createElement("select");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "선택하세요";
    input.append(placeholder);

    field.options.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      input.append(option);
    });
  } else {
    input = document.createElement("input");
    input.type = field.type;
  }

  input.id = field.name;
  input.name = field.name;
  input.required = Boolean(field.required);

  if (field.placeholder) {
    input.placeholder = field.placeholder;
  }

  if (field.accept) {
    input.accept = field.accept;
  }

  if (field.min !== undefined) {
    input.min = field.min;
  }

  wrapper.append(input);
  return wrapper;
}

function renderNavigation() {
  navigation.innerHTML = "";

  MODULES.forEach((module) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = module.id === state.activeModuleId ? "nav-item active" : "nav-item";
    button.dataset.moduleId = module.id;
    button.innerHTML = `
      <span class="nav-index">${module.icon}</span>
      <span>${module.title}</span>
    `;
    navigation.append(button);
  });
}

function renderForm() {
  const module = getModuleById(state.activeModuleId);
  const requiredFields = getRequiredFields(module).map((field) => field.label).join(", ");

  formTitle.textContent = module.title;
  formDescription.textContent = `${module.description} 필수 입력: ${requiredFields}`;
  formFields.innerHTML = "";
  photoPreview.hidden = true;
  photoPreview.innerHTML = "";

  module.fields.forEach((field) => {
    formFields.append(createField(field));
  });
}

function formatValue(value) {
  if (!value) {
    return "-";
  }

  if (typeof value === "object" && value.name) {
    return value.name;
  }

  return value;
}

function renderRecords() {
  const module = getModuleById(state.activeModuleId);
  const records = readRecords(module.id);
  const allCount = MODULES.reduce((sum, item) => sum + readRecords(item.id).length, 0);

  listTitle.textContent = `${module.title} 목록`;
  totalCount.textContent = `${allCount}건`;
  activeModuleCount.textContent = `${records.length}건`;
  recordsList.innerHTML = "";

  if (records.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "아직 등록된 데이터가 없습니다.";
    recordsList.append(empty);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement("li");
    item.className = "record-card";

    const titleField = module.fields[0];
    const detailFields = module.fields.slice(1, 5);

    item.innerHTML = `
      <div class="record-header">
        <div>
          <strong>${formatValue(record[titleField.name])}</strong>
          <small>${formatDateTime(record.createdAt)}</small>
        </div>
        <button type="button" class="ghost-button" data-delete-id="${record.id}">삭제</button>
      </div>
      <dl>
        ${detailFields
          .map(
            (field) => `
              <div>
                <dt>${field.label}</dt>
                <dd>${formatValue(record[field.name])}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
      ${record.photoFile?.dataUrl ? `<img class="record-photo" src="${record.photoFile.dataUrl}" alt="${record.photoFile.name}" />` : ""}
    `;

    recordsList.append(item);
  });
}

function setActiveModule(moduleId) {
  state.activeModuleId = moduleId;
  form.reset();
  renderNavigation();
  renderForm();
  renderRecords();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function buildPayload(module) {
  const payload = {};
  const formData = new FormData(form);

  for (const field of module.fields) {
    if (field.type === "file") {
      const file = formData.get(field.name);

      if (file && file.size > 0) {
        payload[field.name] = {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: await readFileAsDataUrl(file)
        };
      }

      continue;
    }

    payload[field.name] = String(formData.get(field.name) || "").trim();
  }

  return payload;
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
  window.setTimeout(() => {
    notice.hidden = true;
  }, 2500);
}

navigation.addEventListener("click", (event) => {
  const button = event.target.closest("[data-module-id]");

  if (!button) {
    return;
  }

  setActiveModule(button.dataset.moduleId);
});

form.addEventListener("change", (event) => {
  if (event.target.type !== "file" || !event.target.files?.[0]) {
    return;
  }

  const file = event.target.files[0];
  const image = document.createElement("img");
  image.alt = file.name;
  image.src = URL.createObjectURL(file);
  photoPreview.innerHTML = "";
  photoPreview.hidden = false;
  photoPreview.append(image);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const module = getModuleById(state.activeModuleId);
  const payload = await buildPayload(module);

  addRecord(module.id, payload);
  form.reset();
  photoPreview.hidden = true;
  photoPreview.innerHTML = "";
  renderRecords();
  showNotice(`${module.title} 데이터가 저장되었습니다.`);
});

recordsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");

  if (!button) {
    return;
  }

  deleteRecord(state.activeModuleId, button.dataset.deleteId);
  renderRecords();
  showNotice("등록 데이터가 삭제되었습니다.");
});

renderNavigation();
renderForm();
renderRecords();
