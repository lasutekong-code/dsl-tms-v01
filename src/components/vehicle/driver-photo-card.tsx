"use client";

import { DriverPhotoCard as DriverPhotoCardInner } from "@/components/vehicle/vehicle-photo-grid";
import type { DriverPhoto } from "@/types/vehicle";

type DriverPhotoCardProps = {
  vehicleId: string;
  driverName: string | null;
  photo: DriverPhoto | null;
};

export function DriverPhotoCard({ vehicleId, driverName, photo }: DriverPhotoCardProps) {
  return <DriverPhotoCardInner vehicleId={vehicleId} driverName={driverName} photo={photo} />;
}
