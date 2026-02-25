'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTrips } from '@/store/reducers/trip-slice';
import { getAllSchools } from '@/store/reducers/suadmin-slice';
import { RootState, AppDispatch } from '@/store';
import { TrackingView } from '@/components/tracking';
import GoogleMapsProvider from '@/components/GoogleMapsProvider';

export default function Page(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  const [status, setStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSchool, setSelectedSchool] = useState("");

  const clearFilters = () => {
    setSelectedSchool("");
    setStatus("");
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const tripState = useSelector((state: RootState) => state.trip);
  const trips = tripState?.trips ?? [];
  const loading = tripState?.loading ?? false;

  const { schools } = useSelector((state: RootState) => state.suadmin);
console.log("trips",trips)
  useEffect(() => {
    dispatch(getAllSchools({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllTrips({ page: 1, limit: 10, status, date: selectedDate, schoolId: selectedSchool }));
  }, [dispatch, status, selectedDate, selectedSchool]);

  const vehicles = useMemo(() => {
    return (trips || []).map((trip: any) => {
      const lastLocation = trip.locations?.length
        ? trip.locations[trip.locations.length - 1]
        : trip.tripEnd
        ? { lat: trip.tripEnd.lat, long: trip.tripEnd.long }
        : trip.tripStart
        ? { lat: trip.tripStart.lat, long: trip.tripStart.long }
        : null;

      return {
        id: String(trip._id),
        name: trip.driver?.fullname || trip.driverName || 'Unknown Driver',
        avatar: trip.driverImage || trip?.driver?.image ||'/assets/avatar-placeholder.png',
        vehicleModel: trip.van?.vehicleType || trip.carName || '',
        plate: trip.van?.carNumber || trip.carNumber || '',
        status: trip.status || 'unknown',
        latitude: lastLocation?.lat || 0,
        longitude: lastLocation?.long || 0,
        tripStart: trip?.tripStart?.startTime ? new Date(trip?.tripStart?.startTime) : undefined,
        driverId: trip?.driver?._id || trip?.driverId,
        tripId: trip?._id,
        driverName: trip.driver?.fullname || trip?.driverName,
        locations:trip?.locations || [],
        carName:trip.van?.vehicleType || trip?.carName || '',
        routeTitle:trip.route?.title || trip?.routeTitle || '',
        routeTripType:trip.route?.tripType || trip?.routeTripType || ''
      };
    });
  }, [trips]);

  return (
    <GoogleMapsProvider>
      <TrackingView
        vehicles={vehicles}
        status={status}
        onStatusChange={setStatus}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedSchool={selectedSchool}
        onSchoolChange={setSelectedSchool}
        schools={schools}
        loading={loading}
        onClearFilters={clearFilters}
      />
    </GoogleMapsProvider>
  );
}
