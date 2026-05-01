import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { institutionRepository } from '../repositories/InstitutionRepository';
import type { DriverInstitutionInsert } from '../types/models';

export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionRepository.listActiveInstitutions(),
  });
}

export function useDriverInstitutions(driverId?: string) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-institutions', driverId],
    queryFn: () => institutionRepository.getDriverInstitutions(driverId as string),
  });
}

export function useAvailableDrivers(institutionId?: string) {
  return useQuery({
    enabled: !!institutionId,
    queryKey: ['available-drivers', institutionId],
    queryFn: () => institutionRepository.listDriversForInstitution(institutionId as string),
  });
}

export function useUpsertDriverInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DriverInstitutionInsert) => institutionRepository.upsertDriverInstitution(input),
    onSuccess: (driverInstitution) => {
      void queryClient.invalidateQueries({ queryKey: ['driver-institutions', driverInstitution.driver_id] });
      void queryClient.invalidateQueries({ queryKey: ['available-drivers', driverInstitution.institution_id] });
    },
  });
}
