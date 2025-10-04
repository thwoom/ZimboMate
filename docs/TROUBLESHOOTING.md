# 🔧 ZimboMate V2 Troubleshooting Guide

_Solutions for common issues and problems_

## 🚨 Quick Fixes

### Application Won't Load

1. **Refresh the page** (Ctrl+R or F5)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check browser compatibility** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
4. **Disable browser extensions** temporarily
5. **Try incognito/private mode**

### Performance Issues

1. **Check Performance Monitor** (Settings > Performance Monitor)
2. **Close other browser tabs** to free memory
3. **Disable animations** (Settings > Accessibility > Reduce Motion)
4. **Update your browser** to the latest version
5. **Restart your browser** completely

### Data Not Saving

1. **Check browser storage** (ensure local storage is enabled)
2. **Create manual backup** (File Management > Backup)
3. **Export your data** (File Management > Export)
4. **Clear browser storage** and re-import data
5. **Check available disk space**

---

## 🎲 Dice & Rolling Issues

### 3D Dice Not Appearing

**Symptoms**: Dice rolls work but no 3D visualization
**Solutions**:

1. **Check WebGL support**: Visit `chrome://gpu/` to verify WebGL is enabled
2. **Update graphics drivers** on your computer
3. **Try different browser** (Chrome recommended for best 3D support)
4. **Disable hardware acceleration** in browser settings if causing issues
5. **Check for browser extensions** that might block WebGL

### Dice Rolling Slowly

**Symptoms**: Long delay between clicking roll and seeing results
**Solutions**:

1. **Reduce graphics quality** in Settings (if available)
2. **Close other applications** using GPU resources
3. **Check Performance Monitor** for FPS and memory usage
4. **Disable particle effects** temporarily
5. **Use a more powerful device** for complex 3D rendering

### Keyboard Shortcuts Not Working for Dice

**Symptoms**: Space bar or number keys don't work for rolling
**Solutions**:

1. **Click in the dice area** to ensure focus
2. **Check if modal dialogs are open** (press Esc to close)
3. **Verify you're in dice context** (Dice tab or character sheet)
4. **Try clicking the dice roller** to activate it
5. **Refresh the page** if shortcuts stop responding

---

## 👤 Character & Data Issues

### Character Data Lost

**Symptoms**: Character information disappeared or reset
**Solutions**:

1. **Check recent backups** (File Management > Backup > Restore)
2. **Look for auto-saves** in browser local storage
3. **Import previous export** if you have one
4. **Check if switched campaigns** accidentally
5. **Contact support** with details about when data was lost

### Stats Not Calculating Correctly

**Symptoms**: Modifiers or derived stats seem wrong
**Solutions**:

1. **Verify stat values** are in correct range (3-18 typical)
2. **Check for active debilities** affecting calculations
3. **Look for equipment bonuses** modifying stats
4. **Refresh character sheet** (switch tabs and back)
5. **Report bug** if calculations are definitely incorrect

### Equipment Load Issues

**Symptoms**: Load calculations seem incorrect
**Solutions**:

1. **Check item weights** in equipment details
2. **Verify equipped vs carried items** (only carried items count)
3. **Look for strength bonuses** affecting load capacity
4. **Check for magical items** with special weight properties
5. **Recalculate manually** to verify system calculation

---

## 🎮 Session & Multiplayer Issues

### Can't Connect to Multiplayer Session

**Symptoms**: Unable to join or create multiplayer sessions
**Solutions**:

1. **Check internet connection** stability
2. **Disable VPN** temporarily if using one
3. **Try different network** (mobile hotspot, different WiFi)
4. **Check firewall settings** (ensure WebSocket connections allowed)
5. **Contact session host** to verify session is active

### Dice Rolls Not Syncing

**Symptoms**: Other players don't see your rolls or vice versa
**Solutions**:

1. **Refresh the session** (leave and rejoin)
2. **Check connection status** in multiplayer panel
3. **Verify all players on same session** ID
4. **Test with simple roll** to verify sync
5. **Restart session** if sync continues failing

### Session Tools Not Working

**Symptoms**: Notes, timers, or trackers not functioning
**Solutions**:

1. **Check local storage** permissions in browser
2. **Try creating new items** instead of editing existing
3. **Export session data** as backup before troubleshooting
4. **Clear session cache** and restart
5. **Switch to different session tool** temporarily

---

## 📁 File Management Issues

### Import Fails

**Symptoms**: Files won't import or show validation errors
**Solutions**:

1. **Check file format** (JSON, CSV, XML supported)
2. **Verify file size** (large files may timeout)
3. **Validate JSON syntax** using online JSON validator
4. **Try smaller file** to test import functionality
5. **Check file encoding** (UTF-8 recommended)

### Export Not Working

**Symptoms**: Export button doesn't work or files are empty
**Solutions**:

1. **Check browser download settings** and permissions
2. **Try different export format** (JSON vs CSV)
3. **Disable popup blockers** temporarily
4. **Check available disk space** for downloads
5. **Try exporting smaller data sets** first

### Backup/Restore Issues

**Symptoms**: Backups fail to create or restore
**Solutions**:

1. **Verify browser storage quota** isn't exceeded
2. **Check backup file integrity** before restoring
3. **Try manual export/import** instead of backup system
4. **Clear old backups** to free space
5. **Use external backup** (download exports regularly)

---

## 🎨 Display & Interface Issues

### Theme Not Applying

**Symptoms**: Theme changes don't take effect
**Solutions**:

1. **Hard refresh** the page (Ctrl+Shift+R)
2. **Clear CSS cache** in browser developer tools
3. **Check for browser extensions** modifying CSS
4. **Try different theme** to test functionality
5. **Reset to default theme** and try again

### Layout Broken or Overlapping

**Symptoms**: UI elements in wrong positions or overlapping
**Solutions**:

1. **Check browser zoom level** (should be 100%)
2. **Resize browser window** to trigger layout recalculation
3. **Clear browser cache** completely
4. **Try different screen resolution** if possible
5. **Report layout bug** with screenshot and browser info

### Animations Stuttering

**Symptoms**: Animations are choppy or laggy
**Solutions**:

1. **Enable hardware acceleration** in browser settings
2. **Close other tabs/applications** using resources
3. **Reduce animation complexity** in accessibility settings
4. **Check Performance Monitor** for bottlenecks
5. **Try different browser** for comparison

---

## 🔊 Audio Issues

### No Sound Effects

**Symptoms**: Dice rolls and actions have no audio
**Solutions**:

1. **Check browser audio permissions** for the site
2. **Verify system volume** and browser volume
3. **Look for audio settings** in ZimboMate preferences
4. **Try different browser** to test audio
5. **Check for browser extensions** blocking audio

### Audio Lag or Distortion

**Symptoms**: Sound effects delayed or distorted
**Solutions**:

1. **Check system audio drivers** are up to date
2. **Close other audio applications**
3. **Try different audio output device**
4. **Reduce audio quality** if setting available
5. **Restart browser** to reset audio system

---

## 🌐 Browser-Specific Issues

### Chrome Issues

- **WebGL Problems**: Check `chrome://gpu/` for graphics info
- **Storage Limits**: Check `chrome://settings/content/all` for site data
- **Extension Conflicts**: Disable extensions one by one to identify conflicts

### Firefox Issues

- **WebGL Disabled**: Enable in `about:config` → `webgl.disabled` = false
- **Storage Quota**: Check `about:preferences#privacy` storage settings
- **Tracking Protection**: May block some features, try disabling

### Safari Issues

- **WebGL Support**: Ensure "WebGL" is enabled in Develop menu
- **Local Storage**: Check Privacy settings aren't blocking storage
- **Cross-Origin**: Some features may be limited by security settings

### Edge Issues

- **Legacy Mode**: Ensure using Chromium-based Edge (not IE mode)
- **SmartScreen**: May block some downloads, check security settings
- **Extensions**: Similar to Chrome, disable to test conflicts

---

## 📱 Mobile & Touch Issues

### Touch Controls Not Working

**Symptoms**: Can't interact with 3D dice or UI elements on mobile
**Solutions**:

1. **Enable touch events** in browser settings
2. **Try landscape orientation** for better layout
3. **Check for mobile-specific browser** issues
4. **Use desktop mode** in browser if available
5. **Try different mobile browser**

### Performance on Mobile

**Symptoms**: App runs slowly on phone/tablet
**Solutions**:

1. **Close other mobile apps** to free memory
2. **Disable 3D effects** to improve performance
3. **Use WiFi instead of cellular** for better connection
4. **Try tablet instead of phone** for better performance
5. **Consider desktop/laptop** for full experience

---

## 🔍 Debugging Tools

### Browser Developer Tools

1. **Open DevTools** (F12 or Ctrl+Shift+I)
2. **Check Console** for error messages
3. **Monitor Network** tab for failed requests
4. **Inspect Elements** for layout issues
5. **Check Application** tab for storage data

### ZimboMate Built-in Tools

1. **Performance Monitor** (Settings > Performance Monitor)
   - FPS tracking
   - Memory usage
   - Component performance
2. **Accessibility Checker** (Settings > Accessibility Checker)
   - WCAG compliance
   - Color contrast
   - Keyboard navigation
3. **Error Boundary** (automatic)
   - Graceful error handling
   - Error reporting
   - Recovery options

### Diagnostic Information

When reporting issues, include:

- **Browser name and version**
- **Operating system**
- **Screen resolution**
- **Error messages** from console
- **Steps to reproduce** the issue
- **Expected vs actual behavior**

---

## 🆘 Getting Additional Help

### Self-Service Resources

1. **User Guide** - Complete feature documentation
2. **Quick Start** - Basic setup and usage
3. **Keyboard Shortcuts** - All available shortcuts
4. **FAQ** - Frequently asked questions

### Community Support

1. **Discord Server** - Real-time community help
2. **Forums** - Detailed discussions and solutions
3. **GitHub Issues** - Bug reports and feature requests
4. **Reddit Community** - User discussions and tips

### Direct Support

1. **Bug Reports** - GitHub issues with detailed info
2. **Feature Requests** - Suggest improvements
3. **Technical Support** - Direct contact for complex issues
4. **Documentation Feedback** - Help improve guides

---

## 🔄 Recovery Procedures

### Complete Data Recovery

If you've lost all data:

1. **Check browser storage** (DevTools > Application > Local Storage)
2. **Look for backup files** in downloads folder
3. **Check auto-exports** if enabled
4. **Contact support** with account details
5. **Start fresh** with new character if necessary

### Partial Data Recovery

If some data is missing:

1. **Export current data** immediately
2. **Check specific backup dates** for missing info
3. **Manually recreate** critical missing data
4. **Import from partial backups** if available
5. **Document what's missing** for future prevention

### Performance Recovery

If app becomes unusable:

1. **Force refresh** (Ctrl+Shift+R)
2. **Clear all browser data** for the site
3. **Restart browser** completely
4. **Try incognito mode** for clean state
5. **Re-import data** from backups

---

## 🛡️ Prevention Tips

### Regular Maintenance

- **Weekly backups** of important campaign data
- **Monthly exports** as additional safety
- **Browser cache clearing** periodically
- **Update browser** regularly
- **Monitor performance** for early warning signs

### Best Practices

- **Save frequently** during long sessions
- **Use multiple backup methods** (local + cloud)
- **Test imports/exports** periodically
- **Keep browser updated** for security and performance
- **Document important settings** and configurations

### Risk Mitigation

- **Multiple browsers** for redundancy
- **External backups** outside browser storage
- **Regular testing** of critical features
- **Alternative devices** for important sessions
- **Offline backups** for critical campaign data

---

## 📞 Emergency Contacts

### Immediate Issues

- **Critical Bug**: Create GitHub issue with "urgent" label
- **Data Loss**: Contact support immediately with details
- **Security Concern**: Report via secure channel
- **Session Disruption**: Check Discord for real-time help

### Non-Urgent Issues

- **Feature Questions**: Community forums or Discord
- **Usage Help**: User guide or community resources
- **Suggestions**: GitHub discussions or feature requests
- **General Feedback**: Community channels or direct feedback

---

_Remember: Most issues have simple solutions. Try the quick fixes first, then work through the specific troubleshooting steps for your situation._

**Need more help?** Check the [User Guide](./USER_GUIDE.md) or reach out to the community! 🎲✨
