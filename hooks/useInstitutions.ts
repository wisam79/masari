import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { institutionRepository } from '../repositories/InstitutionRepository';
import type { DriverInstitutionInsert } from '../types/models';

/**
 * Fetches the list of active institutions.
 * @returns React Query object containing active institutions.
 */
export function useInstitutions() {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: () => institutionRepository.listActiveInstitutions(),
  });
}

/**
 * Fetches institutions associated with a driver.
 * @param driverId - The ID of the driver.
 * @returns React Query object containing the driver's institutions.
 */
export function useDriverInstitutions(driverId?: string) {
  return useQuery({
    enabled: !!driverId,
    queryKey: ['driver-institutions', driverId],
    queryFn: () => institutionRepository.getDriverInstitutions(driverId as string),
  });
}

/**
 * Fetches drivers available for an institution.
 * @param institutionId - The ID of the institution.
 * @returns React Query object containing available drivers.
 */
export function useAvailableDrivers(institutionId?: string) {
  return useQuery({
    enabled: !!institutionId,
    queryKey: ['available-drivers', institutionId],
    queryFn: () => institutionRepository.listDriversForInstitution(institutionId as string),
  });
}

/**
 * Upserts a driver-institution relationship.
 * @returns React Mutation object for upserting the relationship.
 */
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
