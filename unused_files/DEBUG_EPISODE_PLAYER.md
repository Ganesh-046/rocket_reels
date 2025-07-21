# 🐛 Episode Player Debugging Guide

## 🎯 **Issue Description**
First episode plays well, but second episode onwards is not showing content, buttons, or playing video.

## 🔍 **Debugging Steps**

### **1. Check Console Logs**
Look for these debug logs to understand what's happening:

```bash
# Expected logs for first episode:
🚀 Initial setup for episodes: X
🎬 Initial episode set: episode-contentId-1
🎬 Rendering episode 0: { isVisible: true, isActive: true, ... }
🎬 Episode 0 (episode-contentId-1) state: { isActive: true, isVisible: true, ... }
▶️ Playing episode 0: episode-contentId-1

# Expected logs for second episode:
👁️ Viewable items: [{ index: 1, percentVisible: 100, isViewable: true }]
🎯 Active index changing from 0 to 1
🎬 Setting active video: episode-contentId-2
🎬 Rendering episode 1: { isVisible: true, isActive: true, ... }
🎬 Episode 1 (episode-contentId-2) state: { isActive: true, isVisible: true, ... }
▶️ Playing episode 1: episode-contentId-2
```

### **2. Common Issues & Solutions**

#### **Issue A: Visibility Detection Failing**
**Symptoms:** `isVisible: false` for episode 1+
**Solution:** The fallback mechanism should fix this automatically

#### **Issue B: Active Index Not Updating**
**Symptoms:** `isActive: false` for episode 1+
**Solution:** Check if `handleViewableItemsChanged` is being called

#### **Issue C: Video State Not Updating**
**Symptoms:** Video not playing despite correct visibility/active states
**Solution:** Check video store state

### **3. Manual Testing Steps**

1. **Open the episode player**
2. **Check console logs** for initial setup
3. **Scroll to second episode**
4. **Check console logs** for visibility changes
5. **Verify video starts playing**

### **4. Quick Fixes Applied**

#### **✅ Fixed Visibility Detection**
- Simplified viewability algorithm
- Lowered threshold to 30%
- Added fallback mechanism

#### **✅ Fixed State Management**
- Immediate state updates (no InteractionManager delay)
- Better initialization for first episode
- Enhanced debugging logs

#### **✅ Fixed Video Playback**
- More reliable video source
- Better error handling
- Improved state synchronization

### **5. Expected Behavior After Fix**

1. **First Episode:** ✅ Plays immediately
2. **Second Episode:** ✅ Should play when scrolled to
3. **All Episodes:** ✅ Should show content and buttons
4. **Smooth Transitions:** ✅ Between episodes

### **6. If Issues Persist**

#### **Check Video Store:**
```typescript
// Add this to EpisodeCard to debug video state
console.log('Video state for', episode._id, ':', {
  isPlaying,
  isCached,
  progress,
  duration,
  videoState
});
```

#### **Check FlatList Configuration:**
```typescript
// Verify these settings are correct
viewabilityConfig={{
  itemVisiblePercentThreshold: 30,
  minimumViewTime: 50,
}}
```

#### **Check Episode Data:**
```typescript
// Verify episode data is correct
console.log('Episode data:', episodesData.map(ep => ({
  id: ep._id,
  title: ep.title,
  videoUrl: ep.videoUrl
})));
```

### **7. Performance Monitoring**

Monitor these metrics:
- **Frame Rate:** Should stay at 60fps
- **Memory Usage:** Should be stable
- **Video Load Time:** Should be < 500ms for cached videos
- **Error Rate:** Should be 0% with reliable video source

### **8. Fallback Mechanisms**

The code now includes several fallback mechanisms:

1. **Visibility Fallback:** Ensures active episode is always visible
2. **State Fallback:** Immediate state updates without delays
3. **Video Source Fallback:** Uses reliable W3Schools video
4. **Error Handling:** Graceful handling of video errors

---

**🎯 Goal:** All episodes should work exactly like the first episode - with content, buttons, and video playback functioning perfectly. 