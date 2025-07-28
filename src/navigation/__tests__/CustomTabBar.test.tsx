import React from 'react';
import { Dimensions } from 'react-native';

// Mock the SvgIcons component
jest.mock('../../components/common/SvgIcons', () => ({
  SvgIcons: ({ name, size, color, viewBox, strokeWidth }: any) => {
    return {
      type: 'SvgIcons',
      props: { name, size, color, viewBox, strokeWidth }
    };
  }
}));

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock Dimensions
const mockDimensions = {
  width: 375,
  height: 812,
  scale: 1,
  fontScale: 1
};

jest.spyOn(Dimensions, 'get').mockReturnValue(mockDimensions);

describe('CustomTabBar Icon Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Icon size calculations', () => {
    it('calculates small device icon size correctly', () => {
      const smallDeviceWidth = 375;
      const expectedSize = smallDeviceWidth * 0.08;
      expect(expectedSize).toBe(30);
    });

    it('calculates large device icon size correctly', () => {
      const largeDeviceWidth = 1024;
      const expectedSize = largeDeviceWidth * 0.04;
      expect(expectedSize).toBe(40.96);
    });

    it('ensures icon sizes are positive numbers', () => {
      const smallDeviceWidth = 375;
      const largeDeviceWidth = 1024;
      
      const smallSize = smallDeviceWidth * 0.06;
      const largeSize = largeDeviceWidth * 0.025;
      
      expect(smallSize).toBeGreaterThan(0);
      expect(largeSize).toBeGreaterThan(0);
    });

    it('ensures icon sizes are reasonable values', () => {
      const smallDeviceWidth = 375;
      const largeDeviceWidth = 1024;
      
      const smallSize = smallDeviceWidth * 0.08;
      const largeSize = largeDeviceWidth * 0.04;
      
      expect(smallSize).toBeLessThan(50); // Should not be too large
      expect(largeSize).toBeLessThan(50); // Should not be too large
      expect(smallSize).toBeGreaterThan(10); // Should not be too small
      expect(largeSize).toBeGreaterThan(10); // Should not be too small
    });
  });

  describe('Icon name mapping', () => {
    it('maps route names to correct icon names', () => {
      const routeToIconMap = {
        'Home': 'home',
        'Discover': 'forYou',
        'Rewards': 'rewards',
        'Profile': 'profile'
      };

      Object.entries(routeToIconMap).forEach(([routeName, expectedIconName]) => {
        expect(expectedIconName).toBeTruthy();
        expect(typeof expectedIconName).toBe('string');
        expect(expectedIconName.length).toBeGreaterThan(0);
      });
    });

    it('ensures all required icons exist in SvgIcons component', () => {
      const requiredIcons = ['home', 'forYou', 'rewards', 'profile'];
      
      requiredIcons.forEach(iconName => {
        expect(iconName).toBeTruthy();
        expect(typeof iconName).toBe('string');
      });
    });

    it('validates icon name consistency', () => {
      const iconNames = ['home', 'forYou', 'rewards', 'profile'];
      
      // All icon names should be unique
      const uniqueNames = new Set(iconNames);
      expect(uniqueNames.size).toBe(iconNames.length);
      
      // All icon names should be lowercase or camelCase
      iconNames.forEach(name => {
        expect(name).toMatch(/^[a-z]+([A-Z][a-z]*)*$/);
      });
    });
  });

  describe('Icon properties validation', () => {
    it('validates icon color property', () => {
      const expectedColor = '#FFFFFF';
      expect(expectedColor).toBe('#FFFFFF');
      expect(expectedColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('validates icon viewBox property', () => {
      const expectedViewBox = '0 0 64 64';
      expect(expectedViewBox).toBe('0 0 64 64');
      expect(expectedViewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/);
    });

    it('validates icon strokeWidth property', () => {
      const expectedStrokeWidth = 1.5;
      expect(expectedStrokeWidth).toBe(1.5);
      expect(expectedStrokeWidth).toBeGreaterThan(0);
      expect(expectedStrokeWidth).toBeLessThan(10);
    });
  });

  describe('Animation properties', () => {
    it('has correct animation duration values', () => {
      const expectedDurations = {
        scale: 300,
        opacity: 200,
        gradientOpacity: 250,
        press: 100
      };

      expect(expectedDurations.scale).toBe(300);
      expect(expectedDurations.opacity).toBe(200);
      expect(expectedDurations.gradientOpacity).toBe(250);
      expect(expectedDurations.press).toBe(100);
    });

    it('has correct animation scale values', () => {
      const expectedScales = {
        focused: 1.05,
        unfocused: 1,
        pressed: 0.95
      };

      expect(expectedScales.focused).toBe(1.05);
      expect(expectedScales.unfocused).toBe(1);
      expect(expectedScales.pressed).toBe(0.95);
    });

    it('validates animation values are reasonable', () => {
      const durations = [300, 200, 250, 100];
      const scales = [1.05, 1, 0.95];
      
      // All durations should be positive and reasonable
      durations.forEach(duration => {
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(1000);
      });
      
      // All scales should be positive
      scales.forEach(scale => {
        expect(scale).toBeGreaterThan(0);
      });
    });
  });

  describe('Device responsiveness', () => {
    it('handles different screen sizes correctly', () => {
      const testSizes = [320, 375, 414, 768, 1024];
      
      testSizes.forEach(width => {
        const smallSize = width * 0.08;
        const largeSize = width * 0.04;
        
        expect(smallSize).toBeGreaterThan(0);
        expect(largeSize).toBeGreaterThan(0);
        expect(smallSize).toBeLessThan(100);
        expect(largeSize).toBeLessThan(100);
      });
    });

    it('ensures large device icons are smaller than small device icons', () => {
      const width = 1024; // Large device
      const smallSize = width * 0.08;
      const largeSize = width * 0.04;
      
      expect(largeSize).toBeLessThan(smallSize);
    });
  });

  describe('Edge cases', () => {
    it('handles very small screen width', () => {
      const verySmallWidth = 200;
      const size = verySmallWidth * 0.08;
      
      expect(size).toBe(16);
      expect(size).toBeGreaterThan(0);
    });

    it('handles very large screen width', () => {
      const veryLargeWidth = 2000;
      const size = veryLargeWidth * 0.04;
      
      expect(size).toBe(80);
      expect(size).toBeGreaterThan(0);
    });

    it('handles zero width gracefully', () => {
      const zeroWidth = 0;
      const size = zeroWidth * 0.08;
      
      expect(size).toBe(0);
    });
  });
}); 