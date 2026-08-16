// FasalNirnay — Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
});

function initEventListeners() {
  // Why these actions button
  const whyBtn = document.getElementById('whyActionsBtn');
  if (whyBtn) {
    whyBtn.addEventListener('click', openWhyModal);
  }

  // Location selector toggle
  const locationPill = document.querySelector('.location-pill');
  if (locationPill) {
    locationPill.addEventListener('click', () => {
      const locations = ['Nashik, Maharashtra', 'Lasalgaon, Maharashtra', 'Pune, Maharashtra', 'Indore, MP', 'Kolar, Karnataka'];
      const current = document.getElementById('locationText').innerText;
      const nextIdx = (locations.indexOf(current) + 1) % locations.length;
      document.getElementById('locationText').innerText = locations[nextIdx];
    });
  }

  // Language selector toggle
  const langPill = document.querySelector('.lang-pill');
  if (langPill) {
    langPill.addEventListener('click', () => {
      const langs = ['English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'తెలుగు (Telugu)'];
      const current = document.getElementById('langText').innerText;
      const nextIdx = (langs.indexOf(current) + 1) % langs.length;
      document.getElementById('langText').innerText = langs[nextIdx];
    });
  }

  // Backdrop click to close
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openWhyModal() {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h3 class="modal-title">🤖 How AI Decision Engine Works</h3>
    <p class="modal-subtitle">Real-time market intelligence analyzing 120+ Mandis across India.</p>
    
    <div class="modal-info-box">
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="font-size: 20px;">📊</span>
        <div>
          <strong style="color: #111827; font-size: 14px;">Arrival Volume Forecast</strong>
          <p style="font-size: 13px; color: #4b5563;">Tracks truck movements and harvest declarations to predict supply gluts or shortages before prices change.</p>
        </div>
      </div>
    </div>

    <div class="modal-info-box">
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="font-size: 20px;">⏳</span>
        <div>
          <strong style="color: #111827; font-size: 14px;">Shelf Life & Spoilage Index</strong>
          <p style="font-size: 13px; color: #4b5563;">Uses local temperature, humidity, and harvest timestamp to calculate exact perishability windows.</p>
        </div>
      </div>
    </div>

    <div class="modal-info-box">
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="font-size: 20px;">💰</span>
        <div>
          <strong style="color: #111827; font-size: 14px;">Multi-Channel Profit Optimization</strong>
          <p style="font-size: 13px; color: #4b5563;">Compares local APMC mandi rates against Quick Commerce (Blinkit/Swiggy) and direct buyer offers to maximize net profit after logistics.</p>
        </div>
      </div>
    </div>

    <button class="modal-btn-confirm" onclick="closeModal()">Got it</button>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
}

function openCropModal(cropName, recommendation, profitImpact, sellTime, details) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      <h3 class="modal-title" style="margin-bottom: 0;">${cropName} Recommendation</h3>
      <span style="background: #e6f4ea; color: #167a42; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 12px;">AI Verified</span>
    </div>
    
    <p class="modal-subtitle">Detailed breakdown and market intelligence for your lot.</p>

    <div class="modal-info-box" style="border-left: 4px solid #167a42;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <span style="font-size: 11px; color: #6b7280; font-weight: 600;">RECOMMENDED ACTION</span>
          <div style="font-size: 16px; font-weight: 800; color: #111827;">${recommendation}</div>
        </div>
        <div>
          <span style="font-size: 11px; color: #6b7280; font-weight: 600;">TIMELINE</span>
          <div style="font-size: 16px; font-weight: 800; color: #111827;">${sellTime}</div>
        </div>
      </div>
    </div>

    <div class="modal-info-box">
      <strong style="color: #111827; font-size: 13px;">Market Rationale & Analysis:</strong>
      <p style="font-size: 13px; color: #4b5563; margin-top: 4px; line-height: 1.4;">${details}</p>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button class="modal-btn-confirm" onclick="alert('Action confirmed! Transport booking initiated.'); closeModal();">Proceed with ${recommendation}</button>
    </div>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
}

function openChannelModal(channelName, description, themeColor) {
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <h3 class="modal-title">Sell on ${channelName}</h3>
    <p class="modal-subtitle">${description}</p>

    <div class="modal-info-box">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <label style="font-size: 12px; font-weight: 700; color: #374151;">Select Lot to Sell:</label>
        <select style="padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13.5px;">
          <option>Tomato — 1,000 kg (Harvested 20 May)</option>
          <option>Onion — 2,000 kg (Harvested 21 May)</option>
          <option>Leafy Vegetables — 750 kg (Harvested 21 May)</option>
        </select>

        <label style="font-size: 12px; font-weight: 700; color: #374151; margin-top: 6px;">Pickup Address:</label>
        <input type="text" value="Farm #42, Dindori Road, Nashik" style="padding: 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13.5px;" />
      </div>
    </div>

    <button class="modal-btn-confirm" onclick="alert('Order request submitted to ${channelName}. Partner agent will contact you in 15 mins.'); closeModal();">Confirm & Dispatch</button>
  `;

  document.getElementById('modalBackdrop').classList.add('active');
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function toggleNotifDropdown() {
  alert("🔔 Notifications:\n1. Tomato Mandi price increased by ₹1.20/kg in Nashik\n2. Blinkit daily demand active for Spinach\n3. Weather Alert: Mild shower expected on 24 May");
}
