import '@testing-library/jest-dom';

// Mock HTMLCanvasElement and its methods since jsdom doesn't support canvas
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  arc: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  stroke: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  transform: vi.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'inherit',
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Audio with remove method
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    remove: vi.fn(), // Add the remove method
  })),
});

// Mock Notification
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn().mockReturnValue(null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock lottie-web to prevent rendering issues in tests
vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn().mockReturnValue({
      play: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      destroy: vi.fn(),
      setSpeed: vi.fn(),
      setDirection: vi.fn(),
      goToAndPlay: vi.fn(),
      goToAndStop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    destroy: vi.fn(),
  },
}));

// Mock fetch for loading animation files
global.fetch = vi.fn().mockResolvedValue({
  ok: false,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
});
