import { describe, it, expect, vi, beforeEach } from 'vitest';
import sqlite3 from 'sqlite3';

// Mock sqlite3 completely so database.js doesn't create plants.db
vi.mock('sqlite3', () => ({
  default: {
    verbose: () => ({
      Database: vi.fn().mockImplementation((path, cb) => {
        if (cb) cb(null);
        return {
          serialize: vi.fn((cb) => { if (cb) cb(); }),
          run: vi.fn(),
          all: vi.fn(),
          get: vi.fn()
        };
      })
    })
  }
}));

import * as plantService from './plantService.js';
const db = require('../db/database');
const aiService = require('./aiService');

describe('plantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Use vi.spyOn to mock the actual methods since they are CommonJS exports
    vi.spyOn(db, 'findAll').mockReset();
    vi.spyOn(db, 'create').mockReset();
    vi.spyOn(db, 'deleteById').mockReset();
    vi.spyOn(db, 'updateWatering').mockReset();
    vi.spyOn(db, 'findById').mockReset();
    
    vi.spyOn(aiService, 'suggestInterval').mockReset();
    vi.spyOn(aiService, 'getCareTips').mockReset();
  });

  describe('getAllPlants', () => {
    it('should return all plants with image URLs', async () => {
      db.findAll.mockResolvedValue([
        { id: '1', name: 'Aloe Vera', type: 'succulent', image: 'aloevera.png' },
        { id: '2', name: 'Unknown Plant', type: 'leaf', image: null }
      ]);

      const result = await plantService.getAllPlants('user-1');
      
      expect(db.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
      expect(result[0].imageUrl).toBe('/images/aloevera.png');
      expect(result[1].imageUrl).toBeNull(); 
    });
  });

  describe('addPlant', () => {
    it('should add a plant and suggest interval if not provided', async () => {
      aiService.suggestInterval.mockResolvedValue(10);
      db.create.mockResolvedValue(true);

      const newPlantData = { name: 'Aloe Vera', type: 'succulent' };
      const result = await plantService.addPlant(newPlantData, 'user-1');

      expect(aiService.suggestInterval).toHaveBeenCalledWith('Aloe Vera');
      expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Aloe Vera',
        type: 'succulent',
        baseInterval: 10,
        image: 'aloevera.png',
        userId: 'user-1'
      }));
      expect(result.name).toBe('Aloe Vera');
      expect(result.imageUrl).toBe('/images/aloevera.png');
    });

    it('should use provided interval', async () => {
      db.create.mockResolvedValue(true);

      const newPlantData = { name: 'Monstera', type: 'leaf', baseInterval: 14 };
      const result = await plantService.addPlant(newPlantData, 'user-1');

      expect(aiService.suggestInterval).not.toHaveBeenCalled();
      expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
        baseInterval: 14
      }));
      expect(result.baseInterval).toBe(14);
    });

    it('should throw an error if name is missing', async () => {
      await expect(plantService.addPlant({}, 'user-1')).rejects.toThrow('Plant name is required.');
    });
  });

  describe('waterPlant', () => {
    it('should update the watering date and return the plant', async () => {
      db.updateWatering.mockResolvedValue(true);
      db.findById.mockResolvedValue({ id: '1', name: 'Test', lastWatered: new Date().toISOString() });

      const result = await plantService.waterPlant('1', 'user-1');
      expect(db.updateWatering).toHaveBeenCalledWith('1', expect.any(String), 'user-1');
      expect(db.findById).toHaveBeenCalledWith('1', 'user-1');
      expect(result).not.toBeNull();
      expect(result.name).toBe('Test');
    });

    it('should return null if update fails', async () => {
      db.updateWatering.mockResolvedValue(false);
      
      const result = await plantService.waterPlant('2', 'user-1');
      expect(result).toBeNull();
    });
  });
});
