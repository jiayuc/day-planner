# day-planner

A modern day planner with a visual timer and task management.

## Features

- **Visual Timer**: Analog timer with green/red sectors showing remaining/overtime
- **Task Management**: Add, reorder, and track tasks with drag-and-drop
- **Session Tracking**: Records start/end times for each work session
- **Cumulative Time**: Shows total time spent on each task across all sessions (e.g., "1h 20m")
- **Bell Animation**: Lottie animation when timer completes
- **Responsive Design**: Works on mobile, tablet, and desktop

## Development

```bash
npm install

# Development server (hot reload, dev tools, 3-second timer)
npm run dev

# Production preview server (production build, 15-minute timer)
npm run build
npm run preview
```

### Development vs Production Locally

- **`npm run dev`**: Development mode with hot reload, dev tools panel, 3-second default timer
- **`npm run preview`**: Serves the production build locally (15-minute default timer, no dev tools)

### Development Features

This project includes several development-specific features to make local testing easier:

#### Environment-based Configuration
- **Development mode**: Timer defaults to 3 seconds, bell animation lasts 5 seconds
- **Production mode**: Timer defaults to 15 minutes, bell animation lasts 1 minute

#### Development Tools Panel
In development mode, you'll see a dev tools panel in the bottom-right corner with buttons to:
- **Clear All**: Remove all localStorage data and reload
- **Clear Timer**: Remove only timer-related data and reload  
- **Clear Tasks**: Remove only task-related data and reload
- **Log Storage**: Print all localStorage data to console
- **Quick Timer Tests**: Set timer to 3s, 10s, or 30s for easy testing

#### Console Utilities
Development utilities are also available in the browser console via `window.devUtils`:
```javascript
// Clear all app data
window.devUtils.clearAllStorage()

// Clear specific data types
window.devUtils.clearTimerStorage()
window.devUtils.clearTaskStorage()

// Log current storage state
window.devUtils.logStorage()

// Set timer for testing (in seconds)
window.devUtils.setTestTimer(10)

// Add test sessions to a task (for testing cumulative time)
window.devUtils.addTestSessions('task', 3) // adds 3 sessions to first task containing 'task'
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally (optional)
npm run preview

# Deploy: generate compiled files for hosting website
npm run build && rm -rf docs && mv dist docs
```
