export type VehiclePhotoType = 'front' | 'rear' | 'side';

export interface VehiclePhotoSigned {
  photo_type: VehiclePhotoType;
  signed_url: string;
  expires_in: number;
}

export interface DriverPhotoSigned {
  signed_url: string;
  expires_in: number;
}

export interface VehiclePhotosResponse {
  vehicle_id: string;
  photos: VehiclePhotoSigned[];
}

export interface DriverPhotoResponse {
  vehicle_id: string;
  driver_id: string | null;
  photo: DriverPhotoSigned | null;
}

