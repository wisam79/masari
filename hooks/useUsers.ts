import { useQuery } from '@tanstack/react-query';
import { userRepository } from '../repositories/UserRepository';

export function useUsersByIds(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds));

  return useQuery({
    enabled: uniqueUserIds.length > 0,
    queryKey: ['users-by-ids', uniqueUserIds],
    queryFn: () => userRepository.listUsersByIds(uniqueUserIds),
  });
}
