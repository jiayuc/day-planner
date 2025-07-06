# day-planner

A modern day planner with a visual timer and task management.

## Development

```bash
npm install
npm run dev
```

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
```

## Production Build

```bash
# generate compiled files for hosting website
npm run build && rm -rf docs && mv dist docs
```
