import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePlantStatus } from './usePlantStatus';
import * as plantStatusModule from '../domain/plantStatus';
import type { PlantStatus } from '../domain/plantStatus';
import type { Season } from '../domain/wateringProfiles';

const defaultStatus: PlantStatus = {
  days: 5,
  overdue: false,
  today: false,
  interval: 7,
  isThirsty: false,
};

describe('usePlantStatus hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call calculatePlantStatus and return the status', () => {
    // Spy on the module method
    const mockStatus = defaultStatus;
    const spy = vi.spyOn(plantStatusModule, 'calculatePlantStatus').mockReturnValue(mockStatus);

    const plant = { id: 1, baseInterval: 7 };
    const season: Season = 'summer';

    const { result } = renderHook(() => usePlantStatus(plant, season));

    expect(spy).toHaveBeenCalledWith(plant, season);
    expect(result.current).toEqual(mockStatus);
  });

  it('should memoize the result if inputs do not change', () => {
    const spy = vi.spyOn(plantStatusModule, 'calculatePlantStatus').mockReturnValue(defaultStatus);

    const plant = { id: 1, baseInterval: 7 };
    const season: Season = 'summer';

    const { rerender } = renderHook((props) => usePlantStatus(props.plant, props.season), {
      initialProps: { plant, season },
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // Rerender with exactly the same props references
    rerender({ plant, season });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should recalculate when inputs change', () => {
    const spy = vi.spyOn(plantStatusModule, 'calculatePlantStatus').mockReturnValue(defaultStatus);

    const plant1 = { id: 1, baseInterval: 7 };
    const plant2 = { id: 2, baseInterval: 14 };

    const { rerender } = renderHook(
      (props: { plant: typeof plant1 | typeof plant2; season: Season }) =>
        usePlantStatus(props.plant, props.season),
      {
      initialProps: { plant: plant1, season: 'summer' },
      },
    );

    expect(spy).toHaveBeenCalledTimes(1);

    // Rerender with different props
    rerender({ plant: plant2, season: 'winter' });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
