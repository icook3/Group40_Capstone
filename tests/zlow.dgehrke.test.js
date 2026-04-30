import { jest } from '@jest/globals';

window.APP_CONFIG = {
  apiBaseUrl: '',
  stravaClientId: '',
  stravaRedirectUri: '',
};

const mockSceneUpdate = jest.fn();
const mockHudUpdate = jest.fn();
const mockPhysicsUpdate = jest.fn(() => 25);
const mockAvatarUpdate = jest.fn();
const mockPushSample = jest.fn();

global.fetch = jest.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve('<div id="zlow-root"></div>'),
  })
);

jest.unstable_mockModule('../src/js/scene/env/Track.js', () => ({
  update_pacer_animation: jest.fn(),
}));

jest.unstable_mockModule('../src/js/scene/index.js', () => ({
  ZlowScene: jest.fn().mockImplementation(() => ({
    scene: {},
    update: mockSceneUpdate,
    destroy: jest.fn(),
  })),
}));

jest.unstable_mockModule('../src/js/hud.js', () => ({
  HUD: jest.fn().mockImplementation(() => ({
    initTrainerToggle: jest.fn(),
    update: mockHudUpdate,
    showStartCountdown: jest.fn(({ onDone }) => {
      if (onDone) onDone();
    }),
    totalDistance: 0,
    startTime: 0,
  })),
}));

jest.unstable_mockModule('../src/js/PhysicsEngine.js', () => ({
  PhysicsEngine: jest.fn().mockImplementation(() => ({
    update: mockPhysicsUpdate,
    setSpeed: jest.fn(),
    getSpeed: jest.fn(() => 0),
  })),
}));

jest.unstable_mockModule('../src/js/avatarMovement.js', () => ({
  AvatarMovement: jest.fn().mockImplementation(() => ({
    setSpeed: jest.fn(),
    setPower: jest.fn(),
    update: mockAvatarUpdate,
    creator: { setPacerColors: jest.fn() },
  })),
}));

jest.unstable_mockModule('../src/js/rideHistoryStore.js', () => ({
  rideHistory: {
    samples: [],
    pushSample: mockPushSample,
  },
}));

jest.unstable_mockModule('../src/js/bluetooth.js', () => ({
  TrainerBluetooth: jest.fn(),
}));

jest.unstable_mockModule('../src/js/strava.js', () => ({
  Strava: jest.fn(),
}));

jest.unstable_mockModule('../src/js/keyboardMode.js', () => ({
  KeyboardMode: jest.fn().mockImplementation(() => ({})),
}));

jest.unstable_mockModule('../src/js/standardMode.js', () => ({
  StandardMode: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    connectTrainer: jest.fn(),
    trainer: {
      connect: jest.fn(async () => true),
    },
  })),
}));

jest.unstable_mockModule('../src/js/pause_countdown.js', () => ({
  PauseCountdown: jest.fn().mockImplementation(() => ({})),
}));

jest.unstable_mockModule('../src/js/workouts/RampTestController.js', () => ({
  RampTestController: jest.fn().mockImplementation(() => ({})),
}));

jest.unstable_mockModule('../src/js/workouts/SprintIntervalController.js', () => ({
  SprintIntervalController: jest.fn().mockImplementation(() => ({})),
}));

jest.unstable_mockModule('../src/js/workoutStorage.js', () => ({
  WorkoutStorage: jest.fn().mockImplementation(() => ({
    getCurrentStreak: jest.fn(() => 0),
  })),
}));

jest.unstable_mockModule('../src/js/workoutSession.js', () => ({
  WorkoutSession: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    isWorkoutActive: jest.fn(() => false),
  })),
}));

jest.unstable_mockModule('../src/js/workoutSummary.js', () => ({
  WorkoutSummary: jest.fn().mockImplementation(() => ({})),
  showStopConfirmation: jest.fn(),
}));

jest.unstable_mockModule('../src/js/milestones.js', () => ({
  MilestoneTracker: jest.fn().mockImplementation(() => ({
    reset: jest.fn(),
    check: jest.fn(() => null),
  })),
}));
jest.unstable_mockModule('../src/js/notifications.js', () => ({
  NotificationManager: jest.fn().mockImplementation(() => ({
    show: jest.fn(),
  })),
}));

jest.unstable_mockModule('../src/js/crashReporter.js', () => ({
  initCrashReporter: jest.fn(),
}));

jest.unstable_mockModule('../src/js/main.js', () => ({
  exportToStrava: jest.fn(),
  saveTCX: jest.fn(),
}));

jest.unstable_mockModule('../src/js/trainerCalibration.js', () => ({
  TrainerCalibration: jest.fn(),
  initCalibration: jest.fn(),
}));

jest.unstable_mockModule('../src/js/achievements/achievementManager.js', () => ({
  achievementManager: {
    obtainAchievement: jest.fn(),
  },
}));

const { zlowScreen } = await import('../src/js/views/zlow.js');
const { constants } = await import('../src/js/constants.js');
const { simulationState } = await import('../src/js/simulationstate.js');

describe('dgehrke - zlowScreen integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="dev-controls-wrapper"></div>
      <div id="dev-controls-hud"></div>
      <button id="dev-toggle-btn"></button>
      <button id="menu-btn"></button>
      <button id="calories-reset-btn"></button>
      <button id="pacer-sync-btn"></button>
      <button id="pause-btn"></button>
      <button id="pause-resume-btn"></button>
      <button id="pause-exit-btn"></button>
      <button id="stop-btn"></button>
      <button id="connect-btn"></button>
      <div id="pause-overlay">
        <div class="pause-dialog"></div>
      </div>
      <input id="pacer-speed" />
      <input id="rider-weight" />
      <div id="mainDiv"></div>
    `;

    localStorage.setItem('view', JSON.stringify({ x: 0, y: 0, z: 0 }));
    localStorage.setItem('testMode', 'true');
    sessionStorage.setItem('SelectedWorkout', 'free');

    constants.riderState = { power: 200, speed: 0, calories: 0, distanceMeters: 0 };
    constants.lastTime = 1000;
    simulationState.isPaused = false;

    jest.clearAllMocks();
  });

  test('initZlowApp starts the gameplay loop', () => {
    const screen = new zlowScreen(false);
    const raf = jest.fn();

    screen.initZlowApp({
      getElement: (id) => document.getElementById(id),
      requestAnimationFrameFn: raf,
    });

    expect(screen.loopRunning).toBe(true);
    expect(screen.scene).toBeTruthy();
    expect(screen.hud).toBeTruthy();
    expect(screen.rider).toBeTruthy();
    expect(mockPhysicsUpdate).toHaveBeenCalled();
    expect(mockSceneUpdate).toHaveBeenCalled();
    expect(mockHudUpdate).toHaveBeenCalled();
  });

  test('loop records ride samples when recording', () => {
    const screen = new zlowScreen(false);
    screen.isRecording = true;
    screen.loopRunning = true;

    screen.physics = { update: mockPhysicsUpdate };
    screen.scene = { update: mockSceneUpdate };
    screen.hud = { update: mockHudUpdate, totalDistance: 0 };
    screen.rider = { setSpeed: jest.fn(), setPower: jest.fn(), update: mockAvatarUpdate };
    screen.pacer = { setSpeed: jest.fn(), update: jest.fn() };
    screen.pacerPhysics = { getSpeed: jest.fn(() => 0), setSpeed: jest.fn(), update: jest.fn(() => 0) };
    screen.keyboardMode = {};
    screen.workoutSession = { isWorkoutActive: jest.fn(() => false) };
    screen.milestoneTracker = { check: jest.fn(() => null) };
    screen.notificationManager = { show: jest.fn() };
    screen.sendPeerDataOver = jest.fn();
    screen.checkIfAchievementsUnlocked = jest.fn();

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(2000);

    screen.loop({
      getElement: (id) => document.getElementById(id),
      requestAnimationFrameFn: jest.fn(),
      owner: screen,
    });

    expect(mockPushSample).toHaveBeenCalled();

    nowSpy.mockRestore();
  });

  test('loop does not record ride samples when paused', () => {
    mockPushSample.mockClear();

    const screen = new zlowScreen(false);
    screen.isRecording = true;
    screen.loopRunning = true;

    simulationState.isPaused = true;

    screen.physics = { update: mockPhysicsUpdate };
    screen.scene = { update: mockSceneUpdate };
    screen.hud = { update: mockHudUpdate, totalDistance: 0 };
    screen.rider = { setSpeed: jest.fn(), setPower: jest.fn(), update: mockAvatarUpdate };
    screen.pacer = { setSpeed: jest.fn(), update: jest.fn() };
    screen.pacerPhysics = { getSpeed: jest.fn(() => 0), setSpeed: jest.fn(), update: jest.fn(() => 0) };
    screen.keyboardMode = {};
    screen.workoutSession = { isWorkoutActive: jest.fn(() => false) };
    screen.milestoneTracker = { check: jest.fn(() => null) };
    screen.notificationManager = { show: jest.fn() };
    screen.sendPeerDataOver = jest.fn();
    screen.checkIfAchievementsUnlocked = jest.fn();

    screen.loop({
      getElement: (id) => document.getElementById(id),
      requestAnimationFrameFn: jest.fn(),
      owner: screen,
    });

    expect(mockPushSample).not.toHaveBeenCalled();
  });
});
