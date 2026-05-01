import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceRepository } from '../repositories/AttendanceRepository';
import type { DailyAttendanceInsert, DailyAttendanceUpdate } from '../types/models';

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStudentAttendance(studentId?: string, date = getTodayDate()) {
  return useQuery({
    enabled: !!studentId,
    queryKey: ['student-attendance', studentId, date],
    queryFn: () => attendanceRepository.getStudentAttendanceForDate(studentId as string, date),
  });
}

export function useDriverAttendance(driverId?: string, date = getTodayDate()) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-attendance', driverId, date],
    queryFn: () => attendanceRepository.listDriverAttendanceForDate(driverId as string, date),
  });
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DailyAttendanceInsert) => attendanceRepository.upsertAttendance(input),
    onSuccess: (attendance) => {
      void queryClient.invalidateQueries({
        queryKey: ['student-attendance', attendance.student_id, attendance.date],
      });
      void queryClient.invalidateQueries({
        queryKey: ['driver-attendance', attendance.driver_id, attendance.date],
      });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DailyAttendanceUpdate }) =>
      attendanceRepository.updateAttendance(id, updates),
    onSuccess: (attendance) => {
      void queryClient.invalidateQueries({
        queryKey: ['student-attendance', attendance.student_id, attendance.date],
      });
      void queryClient.invalidateQueries({
        queryKey: ['driver-attendance', attendance.driver_id, attendance.date],
      });
    },
  });
}
