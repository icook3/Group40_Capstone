import { jest } from '@jest/globals';

window.APP_CONFIG = {
  ACHIEVEMENTS_BACKEND_URL: '',
};

const mockShow = jest.fn();

jest.unstable_mockModule('../src/js/notifications.js', () => ({
  NotificationManager: jest.fn().mockImplementation(() => ({
    show: mockShow,
  })),
}));

describe('dgehrke - achievement integration tests', () => {
  let achievementManager;

  beforeEach(async () => {
    jest.resetModules();
    localStorage.clear();
    jest.clearAllMocks();

    window.APP_CONFIG = {
      ACHIEVEMENTS_BACKEND_URL: '',
    };

    global.fetch = jest.fn();

    jest.unstable_mockModule('../src/js/notifications.js', () => ({
      NotificationManager: jest.fn().mockImplementation(() => ({
        show: mockShow,
      })),
    }));

    const module = await import('../src/js/achievements/achievementManager.js');
    achievementManager = module.achievementManager;
  });

  test('unlocks an achievement without backend and stores it locally as unsent', async () => {
    achievementManager.obtainAchievement('PowerMilestone1');

    await Promise.resolve();

    const obtained = JSON.parse(localStorage.getItem('AchievementsObtained'));
    const unsent = JSON.parse(localStorage.getItem('UnsentAchievements'));

    expect(obtained.some((a) => a.ID === 'PowerMilestone1' && a.completed)).toBe(true);
    expect(unsent.some((a) => a.ID === 'PowerMilestone1' && a.completed)).toBe(true);
    expect(mockShow).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('unlocks an achievement with backend and sends it to backend', async () => {
    achievementManager.BACKEND_URL = 'http://localhost:3000';

    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true })  // health check
      .mockResolvedValueOnce({ ok: true }); // POST achievement

    achievementManager.obtainAchievement('PowerMilestone2');

    await Promise.resolve();
    await Promise.resolve();

    const obtained = JSON.parse(localStorage.getItem('AchievementsObtained'));
    const unsent = JSON.parse(localStorage.getItem('UnsentAchievements') || '[]');

    expect(obtained.some((a) => a.ID === 'PowerMilestone2' && a.completed)).toBe(true);
    expect(unsent.some((a) => a.ID === 'PowerMilestone2')).toBe(false);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/achievementsHealth',
      { method: 'GET' }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/achievements',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(['PowerMilestone2']),
      })
    );
  });

  test('does not unlock the same achievement twice', async () => {
    achievementManager.obtainAchievement('PowerMilestone3');
    achievementManager.obtainAchievement('PowerMilestone3');

    await Promise.resolve();
    await Promise.resolve();

    const obtained = JSON.parse(localStorage.getItem('AchievementsObtained'));
    const matching = obtained.filter((a) => a.ID === 'PowerMilestone3' && a.completed);

    expect(matching.length).toBe(1);
    expect(mockShow).toHaveBeenCalledTimes(1);
  });

  test('still stores achievement locally if backend post fails', async () => {
    achievementManager.BACKEND_URL = 'http://localhost:3000';

    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    achievementManager.obtainAchievement('CaloriesMilestone1');

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    const obtained = JSON.parse(localStorage.getItem('AchievementsObtained'));

    expect(obtained.some((a) => a.ID === 'CaloriesMilestone1' && a.completed)).toBe(true);
  });

  test('throws an error for an unknown achievement ID', () => {
      expect(() => {
        achievementManager.obtainAchievement('NotARealAchievement');
      }).toThrow();
    });

    test('shows notification when achievement is unlocked', async () => {
    achievementManager.obtainAchievement('PowerMilestone1');

    await Promise.resolve();

    expect(mockShow).toHaveBeenCalledWith(
      expect.stringContaining('unlocked'),
      true
    );
  });
});