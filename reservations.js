/* ===================================================================
   BEAN & BREW - TABLE RESERVATIONS & EVENT REGISTRATION (reservations.js)
   Table booking validation, VIP pass generation, and Workshop RSVP
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTableBooking();
  initEventWorkshops();
});

function initTableBooking() {
  const form = document.getElementById('tableBookingForm');
  const dateInput = document.getElementById('resDate');
  const passContainer = document.getElementById('reservationPassResult');

  if (!form) return;

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('resName')?.value || 'Guest';
    const email = document.getElementById('resEmail')?.value || '';
    const phone = document.getElementById('resPhone')?.value || '';
    const date = document.getElementById('resDate')?.value || '';
    const time = document.getElementById('resTime')?.value || '';
    const guests = document.getElementById('resGuests')?.value || '2 Guests';
    const seating = document.getElementById('resSeating')?.value || 'Roastery Lounge';
    const notes = document.getElementById('resNotes')?.value || 'Standard Table';

    const bookingId = 'BB-RES-' + Math.floor(1000 + Math.random() * 9000);

    // Format readable date
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (passContainer) {
      passContainer.innerHTML = `
        <div class="reservation-pass" id="printablePass">
          <div class="reservation-pass-header">
            <div>
              <span class="subheading" style="color: var(--c-crema-light);">Confirmed Reservation</span>
              <h3 style="color: var(--c-white); font-size: 1.5rem;">Bean & Brew Artisan Table</h3>
            </div>
            <div class="pass-id">${bookingId}</div>
          </div>

          <div class="pass-details-grid">
            <div>
              <div class="pass-field-label">Reserved Guest</div>
              <div class="pass-field-val">${name}</div>
            </div>
            <div>
              <div class="pass-field-label">Party Size</div>
              <div class="pass-field-val">${guests}</div>
            </div>
            <div>
              <div class="pass-field-label">Date & Time</div>
              <div class="pass-field-val">${formattedDate} at ${time}</div>
            </div>
            <div>
              <div class="pass-field-label">Atmosphere / Seating</div>
              <div class="pass-field-val">${seating}</div>
            </div>
          </div>

          ${notes && notes !== 'Standard Table' ? `
            <div style="background: rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; font-size: 0.85rem; color: #dfd3c8;">
              <strong>Special Requests:</strong> ${notes}
            </div>
          ` : ''}

          <div class="pass-barcode">
            <span>||||||| | ||||| |||| | ||| |||||| | ||||</span>
            <span>SHOW PASS AT HOST STAND</span>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
            <button class="btn btn-outline-light btn-sm" onclick="window.print()">
              🖨️ Print Pass
            </button>
            <button class="btn btn-primary btn-sm" onclick="downloadICS('${name}', '${formattedDate}', '${time}', '${seating}')">
              📅 Add to Calendar
            </button>
          </div>
        </div>
      `;

      passContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (window.cartManager) {
        window.cartManager.showToast(`Table confirmed for ${name}! Pass #${bookingId} generated.`, 'success');
      }
    }
  });
}

// Generate standard calendar event alert
window.downloadICS = function(name, dateStr, timeStr, seating) {
  if (window.cartManager) {
    window.cartManager.showToast(`Calendar reminder created for ${dateStr} at ${timeStr}!`, 'success');
  } else {
    alert(`Calendar reminder set for ${dateStr} at ${timeStr}`);
  }
};

/* ================= Event Workshops Registration ================= */
function initEventWorkshops() {
  const workshopBtns = document.querySelectorAll('.rsvp-workshop-btn');

  workshopBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const workshopTitle = btn.dataset.workshop || 'Artisan Workshop';
      const workshopDate = btn.dataset.date || 'Upcoming';
      const price = btn.dataset.price || '$35';

      const confirmed = confirm(`Would you like to reserve a seat for "${workshopTitle}" on ${workshopDate} (${price}/seat)?\n\nClick OK to confirm your reservation.`);
      if (confirmed) {
        if (window.cartManager) {
          window.cartManager.showToast(`Seat reserved for ${workshopTitle}! Confirmation sent to your email.`, 'success');
        } else {
          alert('Seat successfully reserved!');
        }
        btn.textContent = 'Seat Reserved ✓';
        btn.classList.add('btn-secondary');
        btn.disabled = true;
      }
    });
  });
}
