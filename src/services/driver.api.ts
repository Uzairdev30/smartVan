import axiosInstance from "./axiosInstance";

export async function getAllDrivers(params?: { page?: number; limit?: number }) {
  return await axiosInstance.get<any>('van/GetAllDriversByAdmin', { params });
}

export async function getDriverById(driverId: string) {
  return await axiosInstance.get<any>(`van/getDriverById/${driverId}`);
}

export async function changeDriverStatus(data: { driverIds: string[]; status: string }) {
  return await axiosInstance.post('van/changeDriverStatus', data);
}

export async function removeDriverFromSchool(data: { driverIds: string[] }) {
  return await axiosInstance.post('van/removeDriversFromScool', data);
}