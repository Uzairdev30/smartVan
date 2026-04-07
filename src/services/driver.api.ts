import axiosInstance from "./axiosInstance";

// Get all drivers by admin (with pagination)
export async function getAllDrivers(params?: { page?: number; limit?: number }) {
  return await axiosInstance.get<any>('van/GetAllDriversByAdmin', { params });
}

// Get driver details by ID
export async function getDriverById(driverId: string) {
  return await axiosInstance.get<any>(`van/getDriverById/${driverId}`);
}

// Change driver status (activate/inactive)
export async function changeDriverStatus(data: { id: string; status: string }) {
  return await axiosInstance.put('van/changeDriverStatus', data);
}

// Remove driver from school
export async function removeDriverFromSchool(data: { driverIds: string[] }) {
  return await axiosInstance.post('van/removeDriversFromScool', data);
}
