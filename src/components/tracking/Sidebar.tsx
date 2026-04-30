'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Avatar,
  Box,
  Drawer,
  OutlinedInput,
  Stack,
  Typography,
  Button,
  Tooltip
} from '@mui/material';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Phone as PhoneIcon } from '@mui/icons-material';

export function Sidebar({
  currentVehicleId,
  onVehicleSelect,
  vehicles,
  setSelectedLocations,
  isSuperAdmin,
  selectedSchool
}: any) {
  const mdUp = useMediaQuery('up', 'md');

  const content = (
    <SidebarContent
      currentVehicleId={currentVehicleId}
      onVehicleSelect={onVehicleSelect}
      vehicles={vehicles}
      setSelectedLocations={setSelectedLocations}
      isSuperAdmin={isSuperAdmin}
      selectedSchool={selectedSchool}
    />
  );

  if (mdUp) {
    return (
      <Box
        sx={{
          width: 320,
          height: '100vh',
          p: 1.5
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Drawer
      open
      PaperProps={{
        sx: {
          width: 320,
          height: '100vh',
          bgcolor: '#F6F7F9',
          p: 1.5
        }
      }}
    >
      {content}
    </Drawer>
  );
}

// ================= DRIVER CARD (MATCH TRACKING VIEW STYLE) =================
function DriverCard({
  name,
  vehicle,
  avatar,
  phoneNo,
  selected,
  onClick
}: any) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        backgroundColor: selected ? '#F0F9F4' : '#fff',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': {
          backgroundColor: '#F8F9FA'
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">

        <Avatar
          src={avatar}
          sx={{ width: 42, height: 42 }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: '#191970',
              fontSize: 14
            }}
          >
            {name}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: '#6B7280' }}
          >
            {vehicle}
          </Typography>
        </Box>

        {selected && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#1FA959'
            }}
          />
        )}
      </Stack>

      {selected && phoneNo && (
        <Box sx={{ mt: 1.5 }}>
          <Tooltip title={phoneNo}>
            <Button
              fullWidth
              startIcon={<PhoneIcon />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${phoneNo}`);
              }}
              sx={{
                backgroundColor: '#1FA959',
                color: '#fff',
                textTransform: 'none',
                fontSize: 12,
                '&:hover': {
                  backgroundColor: '#178a48'
                }
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

// ================= CONTENT =================
function SidebarContent({
  vehicles,
  onVehicleSelect,
  setSelectedLocations,
  isSuperAdmin,
  selectedSchool
}: any) {
  const [selectedId, setSelectedId] = useState<string | null>(
    vehicles?.[0]?.id || null
  );

  const [search, setSearch] = useState('');

  const filtered = vehicles.filter((v: any) =>
    (v.driverName || v.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>

      {/* ================= HEADER CARD (MATCH MAIN UI) ================= */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            color: '#191970',
            mb: 1
          }}
        >
          Live Tracking
        </Typography>

        <OutlinedInput
          placeholder="Search Driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{
            borderRadius: 2,
            backgroundColor: '#fff'
          }}
        />
      </Box>

      {/* ================= DRIVER LIST CARD ================= */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          borderRadius: 2,
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: '100%',
            overflowY: 'auto',
            pr: 1
          }}
        >
          {filtered.length === 0 || (isSuperAdmin && (!selectedSchool || selectedSchool === '')) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography sx={{ opacity: 0.6, textAlign: 'center' }}>
                {isSuperAdmin && (!selectedSchool || selectedSchool === '') ? 'Please Select School First' : 'No trips found'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filtered.map((v: any) => (
                <DriverCard
                  key={v.id}
                  name={v.driverName || v.name || 'Unknown'}
                  vehicle={`${v.carName || ''} ${v.plate || ''}`}
                  avatar={v.avatar}
                  phoneNo={v.phoneNo || v.driver?.phoneNo}
                  selected={selectedId === v.id}
                  onClick={() => {
                    setSelectedId(v.id);
                    onVehicleSelect?.(v.id);
                    setSelectedLocations?.(v.locations);
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

    </Box>
  );
}