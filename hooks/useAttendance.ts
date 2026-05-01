import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { attendanceRepository } from '../repositories/AttendanceRepository';
import type { DailyAttendance, DailyAttendanceInsert, DailyAttendanceUpdate } from '../types/models';

export function getTodayDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useStudentAttendance(studentId?: string, date = getTodayDate()) {
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: !!studentId,
    queryKey: ['student-attendance', studentId, date],
    queryFn: () => attendanceRepository.getStudentAttendanceForDate(studentId as string, date),
  });

  useEffect(() => {
    if (!studentId) {
      return undefined;
    }

    const channel = supabase
      .channel(`student-attendance:${studentId}:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_attendance',
          filter: `student_id=eq.${studentId}`,
        },
        (payload: RealtimePostgresChangesPayload<DailyAttendance>) => {
          const payloadDate = payload.eventType === 'DELETE' ? payload.old.date : payload.new.date;
          if (payloadDate !== date) {
            return;
          }

          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['student-attendance', studentId, date], null);
            return;
          }

          queryClient.setQueryData(['student-attendance', studentId, date], payload.new);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [date, queryClient, studentId]);

  return query;
}

export function useDriverAttendance(driverId?: string, date = getTodayDate()) {
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: !!driverId,
    queryKey: ['driver-attendance', driverId, date],
    queryFn: () => attendanceRepository.listDriverAttendanceForDate(driverId as string, date),
  });

  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    const channel = supabase
      .channel(`driver-attendance:${driverId}:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_attendance',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload: RealtimePostgresChangesPayload<DailyAttendance>) => {
          const payloadDate = payload.eventType === 'DELETE' ? payload.old.date : payload.new.date;
          if (payloadDate !== date) {
            return;
          }

          queryClient.setQueryData<DailyAttendance[]>(['driver-attendance', driverId, date], (current = []) => {
            if (payload.eventType === 'DELETE') {
              return current.filter((item) => item.id !== payload.old.id);
            }

            const next = current.filter((item) => item.id !== payload.new.id);
            return [...next, payload.new].sort((left, right) => left.created_at?.localeCompare(right.created_at ?? '') ?? 0);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [date, driverId, queryClient]);

  return query;
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
