"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { ChartPie as ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { Truck } from "@phosphor-icons/react/dist/ssr/Truck";
import { Users } from "@phosphor-icons/react/dist/ssr/Users";
import { Student } from "@phosphor-icons/react/dist/ssr/Student";
import { RoadHorizon } from "@phosphor-icons/react/dist/ssr/RoadHorizon";
import { Calendar } from "@phosphor-icons/react/dist/ssr/Calendar";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRouter } from "next/navigation";

import { NoSsr } from "@/components/core/no-ssr";
import { Option } from "@/components/core/option";
import { StatsCard } from "./StatsCard";

export interface StatsProps {
  data: {
    counts?: {
      vans: number;
      drivers: number;
      kids: number;
      trips: number;
    };
    graph?: { name: string; count: number }[];
  };
  filterType: "yearly" | "monthly";
  onFilterChange: (value: "yearly" | "monthly") => void;
  loading?: boolean;
}

export function Stats({
  data,
  filterType,
  onFilterChange,
  loading,
}: StatsProps): React.JSX.Element {
  const router = useRouter();
  const chartHeight = 250;
  const { graph = [], counts = {} } = data || {};

  const handleCardClick = (title: string) => {
    switch (title) {
      case "Total Vans":
        router.push("/van");
        break;
      case "Total Drivers":
        router.push("/vehicles");
        break;
      case "Total Students":
        router.push("/student");
        break;
      case "Total Trips":
        router.push("/tracking");
        break;
      default:
        break;
    }
  };

  const chartData =
    graph && graph.length > 0
      ? graph
      : filterType === "yearly"
      ? [
          { name: "Jan", count: 0 },
          { name: "Feb", count: 0 },
          { name: "Mar", count: 0 },
          { name: "Apr", count: 0 },
          { name: "May", count: 0 },
          { name: "Jun", count: 0 },
          { name: "Jul", count: 0 },
          { name: "Aug", count: 0 },
          { name: "Sep", count: 0 },
          { name: "Oct", count: 0 },
          { name: "Nov", count: 0 },
          { name: "Dec", count: 0 },
        ]
      : Array.from({ length: 30 }, (_, i) => ({
          name: String(i + 1).padStart(2, "0"),
          count: 0,
        }));

  return (
    <Grid container spacing={2}>
      {/* First Row: 4 Stats Cards - each col-3 */}
      <Grid size={{ md: 3, xs: 6 }}>
        <StatsCard
          value={counts?.vans || 0}
          icon={Truck}
          title="Total Vans"
          variant="active"
          onClick={() => handleCardClick("Total Vans")}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 6 }}>
        <StatsCard
          value={counts?.drivers || 0}
          icon={Users}
          title="Total Drivers"
          variant="delayed"
          onClick={() => handleCardClick("Total Drivers")}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 6 }}>
        <StatsCard
          value={counts?.kids || 0}
          icon={Student}
          title="Total Students"
          variant="missed"
          onClick={() => handleCardClick("Total Students")}
        />
      </Grid>
      <Grid size={{ md: 3, xs: 6 }}>
        <StatsCard
          value={counts?.trips || 0}
          icon={RoadHorizon}
          title="Total Trips"
          variant="active"
          onClick={() => handleCardClick("Total Trips")}
        />
      </Grid>

      {/* Second Row: Yearly Trip Stats (col-8) */}
      <Grid size={{ lg: 8, xs: 12 }}>
        <Card>
          <CardContent sx={{ pb: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    "--Avatar-size": "48px",
                    bgcolor: "var(--mui-palette-background-paper)",
                    boxShadow: "var(--mui-shadows-8)",
                    color: "var(--mui-palette-text-primary)",
                  }}
                >
                  <Calendar fontSize="var(--icon-fontSize-lg)" />
                </Avatar>
                <Typography variant="body1">
                  {filterType === "yearly"
                    ? "Yearly Trip Stats"
                    : "Monthly Trip Stats"}
                </Typography>
              </Stack>

              <Select
                name="filterType"
                value={filterType}
                onChange={(e) =>
                  onFilterChange(e.target.value as "yearly" | "monthly")
                }
                sx={{ width: 140 }}
              >
                <Option value="yearly">Yearly</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
            </Stack>

            <NoSsr fallback={<Box sx={{ height: `${chartHeight}px` }} />}>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<TooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="#3B82F6"
                    radius={[6, 6, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </NoSsr>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ===== Tooltip =====
function TooltipContent({ active, payload }: any): React.JSX.Element | null {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <Paper
      sx={{
        border: "1px solid var(--mui-palette-divider)",
        boxShadow: "var(--mui-shadows-8)",
        p: 1,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {data?.payload?.name}: {data?.value}
      </Typography>
    </Paper>
  );
}
