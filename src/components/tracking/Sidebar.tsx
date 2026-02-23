'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  OutlinedInput,
  Stack,
  Typography,
  Tooltip
} from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Phone as PhoneIcon } from '@mui/icons-material';

export interface SidebarProps {
  currentVehicleId?: string;
  onClose?: () => void;
  onVehicleDeselect?: () => void;
  onVehicleSelect?: (vehicleId: string) => void;
  open?: boolean;
  vehicles: any[];
}

export function Sidebar({
  currentVehicleId,
  onClose,
  onVehicleDeselect,
  onVehicleSelect,
  open,
  vehicles,
  setSelectedLocations
}: any) {
  const mdUp = useMediaQuery('up', 'md');

  const content = (
    <SidebarContent
      currentVehicleId={currentVehicleId}
      onClose={onClose}
      onVehicleDeselect={onVehicleDeselect}
      onVehicleSelect={onVehicleSelect}
      vehicles={vehicles}
      setSelectedLocations={setSelectedLocations}
    />
  );

  if (mdUp) {
    return (
      <Box
        sx={{
          bgcolor: '#F6F7F9',
          // borderRight: '1px solid var(--mui-palette-divider)', // Removed border
          display: { xs: 'none', md: 'block' },
          flex: '0 0 auto',
          width: 320,
          height: '100vh',  // <-- fix: full viewport height
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Drawer
      PaperProps={{ sx: { maxWidth: '100%', width: 320, height: '100vh', bgcolor: '#F6F7F9' } }} // <-- fix: full viewport height
      onClose={onClose}
      open={open}
    >
      {content}
    </Drawer>
  );
}

// ---------------- Driver Card ----------------
interface DriverCardProps {
  name: string;
  vehicle: string;
  avatar: string;
  phoneNo?: string;
  selected?: boolean;
  onClick?: () => void;
}

function DriverCard({ name, vehicle, avatar, phoneNo, selected, onClick }: DriverCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: selected ? '2px solid #4caf50' : '1px solid #e0e0e0',
        backgroundColor: selected ? '#E8F5E9' : '#ffffff',
        borderRadius: 2,
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          backgroundColor: selected ? '#E8F5E9' : '#f8f9fa',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={avatar}
          sx={{
            width: 48,
            height: 48,
            border: '2px solid #f0f0f0'
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            fontWeight="bold"
            sx={{
              fontSize: '14px',
              color: '#191970',
              mb: 0.5
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '12px'
            }}
          >
            {vehicle}
          </Typography>
          {phoneNo && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '12px',
                mt: 0.5
              }}
            >
              📞 {phoneNo}
            </Typography>
          )}
        </Box>
        {selected && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
            }}
          />
        )}
      </Stack>
      {selected && phoneNo && (
        <Box sx={{ mt: 2 }}>
          <Tooltip title={`📞 ${phoneNo}`} arrow placement="top">
            <Button 
              variant="contained" 
              startIcon={<PhoneIcon sx={{ color: 'white' }} />} 
              sx={{ 
                backgroundColor: '#1FA959', 
                color: 'white', 
                '&:hover': { backgroundColor: '#178a48' },
                width: '100%'
              }} 
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${phoneNo}`);
              }}
            >
              Call Driver
            </Button>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

// ---------------- Sidebar Content ----------------
interface SidebarContentProps {
  currentVehicleId?: string;
  onClose?: () => void;
  onVehicleDeselect?: () => void;
  onVehicleSelect?: (vehicleId: string) => void;
  vehicles: any[];
}

function SidebarContent({
  vehicles,
  currentVehicleId,
  onVehicleDeselect,
  onVehicleSelect,
  setSelectedLocations
}: any) {
  const [selectedId, setSelectedId] = useState<string | null>(vehicles[0]?.id);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 🔍 Filter vehicles by driver name
  // 🔍 Filter vehicles by driver name
  const filteredVehicles = vehicles.filter((vehicle: { driverName?: string; name?: string }) => {
    const driverName = (vehicle.driverName || vehicle.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return driverName.includes(query);
  });



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#191970',
            mb: 2
          }}
        >
          Live Tracking
        </Typography>
        <OutlinedInput
          name="query"
          placeholder="Search By Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#ffffff'
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff'
              }
            }
          }}
          fullWidth
        />
      </Box>

      {/* Driver List */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          backgroundColor: '#ffffff'
        }}
      >
        {/* Scrollable driver list */}
        <Box
          sx={{
            flex: '1 1 auto',
            overflowY: 'auto',
            p: 2,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#ccc',
              borderRadius: '3px',
            },
          }}
        >
          <Stack spacing={2}>
            {filteredVehicles.map((vehicle: any) => (
              <DriverCard
                key={vehicle.id}
                name={vehicle.driverName ?? vehicle.name ?? 'Unknown Driver'}
                vehicle={vehicle.carName ? `${vehicle.carName} (${vehicle.plate ?? ''})` : vehicle.id}
                avatar={vehicle.avatar ?? '/assets/default-avatar.png'}
                phoneNo={vehicle.driver?.phoneNo ?? vehicle.phoneNo}
                selected={selectedId === vehicle.id}
                onClick={() => {
                  setSelectedId(vehicle.id);
                  onVehicleSelect?.(vehicle.id);
                  setSelectedLocations(vehicle?.locations)
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
