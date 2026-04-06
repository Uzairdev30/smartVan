import axiosInstance from "./axiosInstance";

// Get all drivers by admin (with pagination)
export async function getAllDrivers(params?: { page?: number; limit?: number }) {
  return await axiosInstance.get<any>('api/van/GetAllDriversByAdmin', { params });
}

// Get driver details by ID
export async function getDriverById(driverId: string) {
  return await axiosInstance.get<any>(`api/van/drivers/${driverId}`);
}

// Verify/Update driver status
export async function verifyDriver(data: { id: string; status: string }) {
  return await axiosInstance.put(`api/van/verify-driver`, data);
}
