import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { userRepository } from '../repositories/UserRepository';

/**
 * Fetches users by their IDs.
 * @param userIds - Array of user IDs to fetch.
 * @returns React Query object containing users data.
 */
export function useUsersByIds(userIds: string[]) {
  const uniqueUserIds = useMemo(() => Array.from(new Set(userIds)), [userIds]);

  return useQuery({
    enabled: uniqueUserIds.length > 0,
    queryKey: ['users-by-ids', uniqueUserIds],
    queryFn: () => userRepository.listUsersByIds(uniqueUserIds),
  });
}
