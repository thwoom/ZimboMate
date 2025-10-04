export const troubleshootingContent = [
  {
    type: 'heading',
    title: '🔧 Troubleshooting Guide',
    content: 'Solve common issues and get back to adventuring',
  },
  {
    type: 'paragraph',
    content:
      'Having trouble with ZimboMate V2? This guide covers the most common issues and their solutions. Most problems can be resolved quickly with these steps.',
  },
  {
    type: 'subheading',
    title: '🚨 Common Issues',
    content: 'Quick fixes for frequent problems',
  },
  {
    type: 'subheading',
    title: "App Won't Load or Crashes",
    content: 'When ZimboMate fails to start',
  },
  {
    type: 'list',
    items: [
      '**Clear Browser Cache**: Ctrl+Shift+Delete → Clear cached images and files',
      '**Hard Refresh**: Ctrl+Shift+R to reload without cache',
      '**Check Browser Console**: F12 → Console tab for error messages',
      '**Try Incognito Mode**: Test if extensions are causing conflicts',
      "**Update Browser**: Ensure you're using a modern browser version",
    ],
  },
  {
    type: 'callout',
    variant: 'warning',
    content:
      "⚠️ If clearing cache doesn't work, try disabling browser extensions one by one to identify conflicts.",
  },
  {
    type: 'subheading',
    title: 'Dice Not Rolling or 3D Issues',
    content: "When the dice system isn't working",
  },
  {
    type: 'list',
    items: [
      '**Check WebGL Support**: Visit webglreport.com to verify 3D support',
      '**Update Graphics Drivers**: Ensure your GPU drivers are current',
      '**Disable Hardware Acceleration**: In browser settings if performance is poor',
      '**Try Different Browser**: Chrome, Firefox, or Edge for best compatibility',
      '**Reduce Graphics Quality**: Lower settings in the dice preferences',
    ],
  },
  {
    type: 'subheading',
    title: 'Data Not Saving',
    content: "When your characters or progress isn't preserved",
  },
  {
    type: 'list',
    items: [
      '**Check Local Storage**: Ensure browser allows local storage',
      '**Disable Private/Incognito Mode**: Use normal browsing mode',
      '**Clear Storage and Reimport**: Settings → Clear Data → Import backup',
      '**Export Before Troubleshooting**: Always backup your data first',
      '**Check Available Space**: Ensure device has sufficient storage',
    ],
  },
  {
    type: 'subheading',
    title: '⌨️ Keyboard Shortcuts Not Working',
    content: "When shortcuts don't respond",
  },
  {
    type: 'subheading',
    title: 'Shortcut Conflicts',
    content: 'Resolving keyboard conflicts',
  },
  {
    type: 'table',
    headers: ['Issue', 'Cause', 'Solution'],
    rows: [
      [
        "Ctrl+K doesn't open palette",
        'Browser extension conflict',
        'Disable extensions or use different browser',
      ],
      [
        "Number keys don't work",
        'Not in Dice tab',
        'Switch to Dice tab (Ctrl+2) first',
      ],
      [
        "Spacebar doesn't roll",
        'Focus on input field',
        'Click outside input fields first',
      ],
      [
        "Tab shortcuts don't work",
        'Page not fully loaded',
        'Wait for complete page load',
      ],
    ],
  },
  {
    type: 'subheading',
    title: 'Context-Specific Issues',
    content: 'When shortcuts work sometimes but not others',
  },
  {
    type: 'list',
    items: [
      '**Input Field Focus**: Click outside text inputs before using shortcuts',
      '**Modal Dialogs**: Close any open dialogs that might capture keyboard events',
      '**Browser Focus**: Ensure the ZimboMate tab is active and focused',
      "**Modifier Keys**: Make sure Ctrl/Cmd keys aren't stuck",
    ],
  },
  {
    type: 'subheading',
    title: '🎮 Performance Issues',
    content: 'When ZimboMate runs slowly',
  },
  {
    type: 'subheading',
    title: 'Slow 3D Animations',
    content: 'Improving dice and animation performance',
  },
  {
    type: 'list',
    items: [
      '**Lower Graphics Quality**: Reduce particle effects and shadows',
      '**Close Other Tabs**: Free up browser memory and CPU',
      '**Check System Resources**: Monitor CPU and memory usage',
      '**Disable Background Apps**: Close unnecessary programs',
      '**Use Dedicated Graphics**: Ensure browser uses GPU acceleration',
    ],
  },
  {
    type: 'subheading',
    title: 'Memory Usage',
    content: 'Managing browser memory consumption',
  },
  {
    type: 'table',
    headers: ['Symptom', 'Likely Cause', 'Solution'],
    rows: [
      ['Slow scrolling', 'Too many DOM elements', 'Refresh page periodically'],
      ['Browser freezing', 'Memory leak', 'Restart browser'],
      ['Animations stuttering', 'CPU overload', 'Close other applications'],
      [
        'Page becomes unresponsive',
        'JavaScript error',
        'Check console for errors',
      ],
    ],
  },
  {
    type: 'subheading',
    title: '📱 Mobile and Touch Issues',
    content: 'Problems on mobile devices',
  },
  {
    type: 'subheading',
    title: 'Touch Interface Problems',
    content: 'Mobile-specific troubleshooting',
  },
  {
    type: 'list',
    items: [
      '**Zoom Issues**: Use browser zoom controls, not pinch-to-zoom',
      '**Touch Targets**: Tap directly on buttons and controls',
      '**Orientation**: Rotate device if interface elements are too small',
      '**Mobile Browser**: Use Chrome or Safari for best mobile experience',
      '**Add to Home Screen**: Install as PWA for better performance',
    ],
  },
  {
    type: 'subheading',
    title: '🔄 Data Recovery',
    content: 'Recovering lost characters or campaigns',
  },
  {
    type: 'subheading',
    title: 'Backup and Recovery',
    content: 'Restoring your data',
  },
  {
    type: 'list',
    items: [
      '**Check Automatic Backups**: File Management → Backup History',
      '**Browser History**: Look for exported files in Downloads',
      '**Local Storage Recovery**: Use browser developer tools to inspect storage',
      '**Import from JSON**: Manually recreate from any exported character files',
      '**Session Storage**: Check if data exists in temporary session storage',
    ],
  },
  {
    type: 'callout',
    variant: 'info',
    content:
      '💡 Always export your characters regularly! Go to File Management → Export to save your data.',
  },
  {
    type: 'subheading',
    title: '🌐 Browser Compatibility',
    content: 'Supported browsers and versions',
  },
  {
    type: 'subheading',
    title: 'Recommended Browsers',
    content: 'Best browsers for ZimboMate V2',
  },
  {
    type: 'table',
    headers: ['Browser', 'Minimum Version', 'Recommended', 'Notes'],
    rows: [
      ['Chrome', '90+', '120+', 'Best overall performance'],
      ['Firefox', '88+', '115+', 'Good privacy and performance'],
      ['Safari', '14+', '16+', 'Best on macOS and iOS'],
      ['Edge', '90+', '120+', 'Good Windows integration'],
    ],
  },
  {
    type: 'subheading',
    title: 'Feature Support',
    content: 'Browser feature requirements',
  },
  {
    type: 'list',
    items: [
      '**WebGL 2.0**: Required for 3D dice and effects',
      '**Local Storage**: Required for saving data',
      '**Web Audio API**: Required for sound effects',
      '**ES2020**: Modern JavaScript features',
      '**CSS Grid**: Layout system support',
    ],
  },
  {
    type: 'subheading',
    title: '🆘 Getting Additional Help',
    content: 'When you need more assistance',
  },
  {
    type: 'subheading',
    title: 'Reporting Issues',
    content: 'How to get help with persistent problems',
  },
  {
    type: 'list',
    items: [
      '**Gather Information**: Browser version, OS, error messages',
      '**Reproduce Steps**: Document exactly what you were doing',
      '**Check Console**: F12 → Console for technical error details',
      '**Export Data**: Save your characters before reporting issues',
      '**Screenshots**: Capture any visual problems or error messages',
    ],
  },
  {
    type: 'subheading',
    title: 'Useful Information to Include',
    content: 'Details that help diagnose problems',
  },
  {
    type: 'table',
    headers: ['Information Type', 'How to Find It', 'Why It Helps'],
    rows: [
      ['Browser Version', 'Settings → About', 'Compatibility checking'],
      ['Operating System', 'System settings', 'Platform-specific issues'],
      ['Error Messages', 'F12 → Console', 'Technical diagnosis'],
      ['Steps to Reproduce', 'Document actions', 'Recreating the problem'],
      ['Character Data', 'Export function', 'Testing with your specific data'],
    ],
  },
  {
    type: 'subheading',
    title: '🔍 Advanced Troubleshooting',
    content: 'For technical users',
  },
  {
    type: 'subheading',
    title: 'Developer Tools',
    content: 'Using browser developer tools',
  },
  {
    type: 'list',
    items: [
      '**Console Tab**: Check for JavaScript errors and warnings',
      '**Network Tab**: Monitor failed resource loads',
      '**Application Tab**: Inspect local storage and service workers',
      '**Performance Tab**: Profile slow operations',
      '**Sources Tab**: Debug JavaScript execution issues',
    ],
  },
  {
    type: 'callout',
    variant: 'warning',
    content:
      '⚠️ Only modify browser storage if you understand the consequences. Always export your data first!',
  },
  {
    type: 'subheading',
    title: '✅ Prevention Tips',
    content: 'Avoiding problems before they happen',
  },
  {
    type: 'list',
    items: [
      '**Regular Backups**: Export your data weekly',
      '**Browser Updates**: Keep your browser current',
      '**Stable Internet**: Use reliable connection for multiplayer',
      '**Close Other Tabs**: Reduce memory pressure',
      '**Monitor Performance**: Watch for slowdowns and address early',
    ],
  },
  {
    type: 'callout',
    variant: 'success',
    content:
      '🎉 Most issues can be resolved with these steps! Remember: when in doubt, try a hard refresh (Ctrl+Shift+R) first.',
  },
]
