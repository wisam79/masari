import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from '../repositories/ProfileRepository';
import type { StudentProfileInsert } from '../types/models';

/**
 * Fetches a student's profile.
 * @param userId - The user ID of the student.
 * @returns React Query object containing the student profile.
 */
export function useStudentProfile(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['student-profile', userId],
    queryFn: () => profileRepository.getStudentProfile(userId as string),
  });
}

/**
 * Upserts a student's profile.
 * @returns React Mutation object for upserting a student profile.
 */
export function useUpsertStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: StudentProfileInsert) => profileRepository.upsertStudentProfile(profile),
    onSuccess: (profile) => {
      void queryClient.invalidateQueries({ queryKey: ['student-profile', profile.user_id] });
      void queryClient.invalidateQueries({ queryKey: ['available-drivers', profile.institution_id] });
    },
  });
}

/**
 * Fetches student profiles for multiple user IDs.
 * @param userIds - Array of user IDs to fetch.
 * @returns React Query object containing student profiles.
 */
export function useStudentProfiles(userIds: string[]) {
  const uniqueUserIds = useMemo(() => Array.from(new Set(userIds)), [userIds]);

  return useQuery({
    enabled: uniqueUserIds.length > 0,
    queryKey: ['student-profiles', uniqueUserIds],
    queryFn: () => profileRepository.listStudentProfiles(uniqueUserIds),
  });
}
