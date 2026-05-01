import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from '../repositories/ProfileRepository';
import type { StudentProfileInsert } from '../types/models';

export function useStudentProfile(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ['student-profile', userId],
    queryFn: () => profileRepository.getStudentProfile(userId as string),
  });
}

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

export function useStudentProfiles(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds));

  return useQuery({
    enabled: uniqueUserIds.length > 0,
    queryKey: ['student-profiles', uniqueUserIds],
    queryFn: () => profileRepository.listStudentProfiles(uniqueUserIds),
  });
}
