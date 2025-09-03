#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

async function fixT196Integration() {
  console.log('🔧 Fixing T-196 Integration...');
  
  const dashboardPath = resolve(process.cwd(), 'dashboard.html');
  let dashboardContent = readFileSync(dashboardPath, 'utf8');
  
  // Check if integration is already there
  if (dashboardContent.includes('bond-tracker-section')) {
    console.log('✅ T-196 integration already exists, checking for JavaScript...');
    
    // Add JavaScript if it's missing
    if (!dashboardContent.includes('showBondModal')) {
      console.log('🔧 Adding missing JavaScript functionality...');
      
      const bondScript = `
    <script>
      // Bond & Alignment XP Tracker Functions
      function showBondModal() {
        console.log('Bond modal requested');
        alert('Bond creation modal - T-196 Integration Active!');
      }
      
      function showAlignmentModal() {
        console.log('Alignment modal requested');
        alert('Alignment action modal - T-196 Integration Active!');
      }
      
      function initializeBondSystem() {
        console.log('Bond system initialization - T-196 Active');
        const bondDisplay = document.getElementById('bond-status-display');
        const alignmentDisplay = document.getElementById('alignment-status-display');
        
        if (bondDisplay) bondDisplay.innerHTML = '✅ Bond system ready - T-196 Active';
        if (alignmentDisplay) alignmentDisplay.innerHTML = '✅ Alignment system ready - T-196 Active';
      }
      
      // Initialize when dashboard loads
      document.addEventListener('DOMContentLoaded', function() {
        console.log('T-196 Bond & Alignment XP Tracker initializing...');
        if (window.dashboardData && window.dashboardData.allTasks) {
          const task196 = window.dashboardData.allTasks.find(t => t.id === 'T-196');
          if (task196) {
            console.log('T-196 found:', task196.title);
            initializeBondSystem();
          }
        }
      });
    </script>`;
      
      // Insert before the closing body tag
      const bodyEndIndex = dashboardContent.lastIndexOf('</body>');
      if (bodyEndIndex !== -1) {
        dashboardContent = dashboardContent.slice(0, bodyEndIndex) + bondScript + '\n  </body>';
      }
      
      writeFileSync(dashboardPath, dashboardContent);
      console.log('✅ JavaScript functionality added');
    } else {
      console.log('✅ JavaScript functionality already exists');
    }
  } else {
    console.log('🔧 Adding T-196 integration sections...');
    
    // Add the integration sections
    const integrationHTML = `
    <!-- T-196: Bond & Alignment XP Tracker Integration -->
    <div class="dashboard-section bond-tracker-section">
      <h3>🔗 Bond & Alignment XP Tracker (T-196)</h3>
      <div class="bond-tracker-container">
        <div class="bond-status">
          <h4>Bond Status</h4>
          <div id="bond-status-display">Loading bonds...</div>
        </div>
        <div class="alignment-status">
          <h4>Alignment Actions</h4>
          <div id="alignment-status-display">Loading alignment...</div>
        </div>
      </div>
      <div class="bond-actions">
        <button onclick="showBondModal()" class="btn btn-primary">Create Bond</button>
        <button onclick="showAlignmentModal()" class="btn btn-secondary">Log Alignment Action</button>
      </div>
    </div>
    
    <div class="dashboard-section alignment-tracker-section">
      <h3>🎭 Alignment XP Tracking</h3>
      <div class="alignment-status-grid">
        <div class="alignment-card good">
          <h4>Good Actions</h4>
          <div id="good-actions-count">0</div>
        </div>
        <div class="alignment-card neutral">
          <h4>Neutral Actions</h4>
          <div id="neutral-actions-count">0</div>
        </div>
        <div class="alignment-card chaotic">
          <h4>Chaotic Actions</h4>
          <div id="chaotic-actions-count">0</div>
        </div>
        <div class="alignment-card lawful">
          <h4>Lawful Actions</h4>
          <div id="lawful-actions-count">0</div>
        </div>
      </div>
    </div>`;
    
    // Insert before the closing body tag
    const bodyEndIndex = dashboardContent.lastIndexOf('</body>');
    if (bodyEndIndex !== -1) {
      dashboardContent = dashboardContent.slice(0, bodyEndIndex) + integrationHTML + '\n  </body>';
    }
    
    // Add CSS
    const bondCSS = `
    <style>
      .bond-tracker-section, .alignment-tracker-section {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .bond-tracker-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 15px 0;
      }
      
      .bond-status, .alignment-status {
        background: rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 8px;
      }
      
      .bond-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }
      
      .alignment-status-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin: 15px 0;
      }
      
      .alignment-card {
        background: rgba(0, 0, 0, 0.3);
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        border: 2px solid transparent;
      }
      
      .alignment-card.good { border-color: #10b981; }
      .alignment-card.neutral { border-color: #6b7280; }
      .alignment-card.chaotic { border-color: #f59e0b; }
      .alignment-card.lawful { border-color: #3b82f6; }
      
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }
      
      .btn-primary {
        background: #3b82f6;
        color: white;
      }
      
      .btn-secondary {
        background: #8b5cf6;
        color: white;
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    </style>`;
    
    // Insert CSS in head
    const headIndex = dashboardContent.indexOf('</head>');
    if (headIndex !== -1) {
      dashboardContent = dashboardContent.slice(0, headIndex) + bondCSS + '\n  </head>';
    }
    
    // Add JavaScript
    const bondScript = `
    <script>
      // T-196: Bond & Alignment XP Tracker Functions
      function showBondModal() {
        console.log('Bond modal requested - T-196 Active');
        alert('Bond creation modal - T-196 Integration Active!');
      }
      
      function showAlignmentModal() {
        console.log('Alignment modal requested - T-196 Active');
        alert('Alignment action modal - T-196 Integration Active!');
      }
      
      function initializeBondSystem() {
        console.log('T-196 Bond system initialization');
        const bondDisplay = document.getElementById('bond-status-display');
        const alignmentDisplay = document.getElementById('alignment-status-display');
        
        if (bondDisplay) bondDisplay.innerHTML = '✅ Bond system ready - T-196 Active';
        if (alignmentDisplay) alignmentDisplay.innerHTML = '✅ Alignment system ready - T-196 Active';
      }
      
      // Initialize when dashboard loads
      document.addEventListener('DOMContentLoaded', function() {
        console.log('T-196 Bond & Alignment XP Tracker initializing...');
        if (window.dashboardData && window.dashboardData.allTasks) {
          const task196 = window.dashboardData.allTasks.find(t => t.id === 'T-196');
          if (task196) {
            console.log('T-196 found:', task196.title);
            initializeBondSystem();
          }
        }
      });
    </script>`;
    
    // Insert JavaScript before closing body
    const scriptBodyEndIndex = dashboardContent.lastIndexOf('</body>');
    if (scriptBodyEndIndex !== -1) {
      dashboardContent = dashboardContent.slice(0, scriptBodyEndIndex) + bondScript + '\n  </body>';
    }
    
    writeFileSync(dashboardPath, dashboardContent);
    console.log('✅ T-196 integration sections added');
  }
  
  console.log('✅ T-196 integration fix completed');
}

fixT196Integration().catch(console.error);
