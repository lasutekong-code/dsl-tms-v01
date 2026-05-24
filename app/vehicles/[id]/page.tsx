import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getVehicleById, vehicles } from "@/lib/vehicles";

type VehicleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { id } = await params;
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/search"
        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
      >
        검색으로 돌아가기
      </Link>

      <section className="mt-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-300">{vehicle.clientName}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {vehicle.vehicleNumber}
            </h1>
            <p className="mt-3 text-slate-300">
              {vehicle.vehicleType} · {vehicle.vehicleModel} · {vehicle.mileage}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
            <HeroStat label="운전자" value={vehicle.driverName} />
            <HeroStat label="센터" value={vehicle.centerName} />
            <HeroStat label="담당자" value={vehicle.managerName} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <DetailSection title="운전자 정보">
            <InfoGrid
              items={[
                ["이름", vehicle.driverName],
                ["연락처", vehicle.driverPhone],
                ["이메일", vehicle.driverEmail],
                ["면허", vehicle.driverLicense],
                ["주소", vehicle.driverAddress],
              ]}
            />
          </DetailSection>

          <DetailSection title="거래처/센터/담당자">
            <InfoGrid
              items={[
                ["거래처", vehicle.clientName],
                ["센터", vehicle.centerName],
                ["담당자", vehicle.managerName],
                ["담당자 연락처", vehicle.managerPhone],
              ]}
            />
          </DetailSection>

          <DetailSection title="차량 기본정보">
            <InfoGrid
              items={[
                ["차량번호", vehicle.vehicleNumber],
                ["모델", vehicle.vehicleModel],
                ["차종", vehicle.vehicleType],
                ["연식", vehicle.manufactureYear],
                ["등록일", vehicle.registrationDate],
                ["연료", vehicle.fuelType],
                ["주행거리", vehicle.mileage],
              ]}
            />
          </DetailSection>

          <DetailSection title="차량 제원/특장">
            <InfoGrid
              items={[
                ["전장", vehicle.specifications.length],
                ["전폭", vehicle.specifications.width],
                ["전고", vehicle.specifications.height],
                ["적재중량", vehicle.specifications.payload],
                ["특장", vehicle.specifications.specialEquipment],
                ["옵션", vehicle.specifications.options],
              ]}
            />
          </DetailSection>

          <DetailSection title="보험/점검">
            <InfoGrid
              items={[
                ["보험사", vehicle.insurance.company],
                ["증권번호", vehicle.insurance.policyNumber],
                ["보험기간", vehicle.insurance.period],
                ["최근 점검일", vehicle.insurance.lastInspection],
                ["다음 점검일", vehicle.insurance.inspectionDue],
              ]}
            />
          </DetailSection>

          <DetailSection title="계약/사업주/세무/메모">
            <InfoGrid
              items={[
                ["계약번호", vehicle.contract.contractNumber],
                ["사업주", vehicle.contract.ownerName],
                ["사업자번호", vehicle.contract.businessNumber],
                ["과세유형", vehicle.contract.taxType],
                ["메모", vehicle.contract.memo],
              ]}
            />
          </DetailSection>
        </div>

        <aside className="space-y-6">
          <DetailSection title="운전자 사진">
            <div className="flex flex-col items-center rounded-3xl bg-slate-100 p-6 text-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-slate-800 text-xl font-bold text-white shadow-inner">
                {vehicle.driverName.slice(0, 1)}
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-800">{vehicle.driverPhotoLabel}</p>
              <p className="mt-1 text-xs text-slate-500">등록된 운전자 프로필 영역</p>
            </div>
          </DetailSection>

          <DetailSection title="차량사진 앞/뒤/옆">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <VehiclePhoto label={vehicle.photos.front} />
              <VehiclePhoto label={vehicle.photos.rear} />
              <VehiclePhoto label={vehicle.photos.side} />
            </div>
          </DetailSection>
        </aside>
      </div>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-medium text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-2 text-sm font-semibold leading-6 text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function VehiclePhoto({ label }: { label: string }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-5 text-center">
      <div>
        <div className="mx-auto mb-3 h-10 w-20 rounded-xl border-4 border-slate-500 bg-white shadow-sm" />
        <p className="text-sm font-bold text-slate-800">차량 {label}</p>
        <p className="mt-1 text-xs text-slate-500">사진 등록 영역</p>
      </div>
    </div>
  );
}
