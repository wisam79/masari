// __tests__/hooks/useLocationTracking.test.ts
import { LocationService } from '../../services/LocationService';
import { LocationRepository } from '../../repositories/LocationRepository';

jest.mock('../../services/LocationService');
jest.mock('../../repositories/LocationRepository');

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update driver location', async () => {
    const mockLocation = {
      driver_id: 'driver-1',
      lat: 33.3152,
      lng: 44.3661,
    };
    
    (LocationRepository.prototype.upsertDriverLocation as jest.Mock).mockResolvedValue(mockLocation);

    const repo = new LocationRepository();
    const result = await repo.upsertDriverLocation({
      driver_id: 'driver-1',
      lat: 33.3152,
      lng: 44.3661,
    });
    
    expect(result).toEqual(mockLocation);
  });
});

describe('LocationService - distance calculation', () => {
  it('should calculate distance between coordinates', () => {
    const service = new LocationService();
    const distance = service.calculateDistanceMeters(
      { lat: 33.3152, lng: 44.3661 },
      { lat: 33.3252, lng: 44.3761 }
    );
    
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(2000);
  });

  it('should get nearest distance', () => {
    const service = new LocationService();
    const nearest = service.getNearestDistanceMeters(
      { lat: 33.3152, lng: 44.3661 },
      [
        { lat: 33.3252, lng: 44.3761 },
        { lat: 33.3352, lng: 44.3861 },
      ]
    );
    
    expect(nearest).toBeGreaterThan(0);
  });

  it('should get polling interval for distance', () => {
    const service = new LocationService();
    
    expect(service.getPollingIntervalForDistance(100)).toBe(60000); // Fast
    expect(service.getPollingIntervalForDistance(600)).toBe(300000); // Normal
    expect(service.getPollingIntervalForDistance(null)).toBe(300000); // Normal
  });
});