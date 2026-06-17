let contact = {};
let vCardString = "";
let qrCodeInstance = null;

// Load user data from JSON and initialize UI
window.addEventListener('load', () => {
  fetch('card.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      contact = data;
      populateUI();
      generateVCardString();
      initQRCode();
    })
    .catch(error => {
      console.error('Error fetching contact details:', error);
      showToast("Error loading contact info");
    });
});

// Populate the HTML placeholders
function populateUI() {
  document.getElementById('card-name').textContent = contact.name || "";
  document.title = `${contact.name || "Business Card"} - DOME Marketplace`;
  document.getElementById('card-title').textContent = contact.title || "";
  document.getElementById('card-company').textContent = contact.company || "";
  
  const phoneEl = document.getElementById('ocr-phone');
  phoneEl.textContent = contact.phone || "";
  phoneEl.href = `tel:${(contact.phone || "").replace(/\s+/g, '')}`;

  const emailEl = document.getElementById('ocr-email');
  emailEl.textContent = contact.email || "";
  emailEl.href = `mailto:${contact.email || ""}`;

  const webEl = document.getElementById('ocr-web');
  webEl.textContent = contact.web || "";
  webEl.href = (contact.web || "").startsWith('http') ? contact.web : `https://${contact.web}`;
}

// Generate the vCard format string
function generateVCardString() {
  vCardString = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name || ""}
N:${contact.lastName || ""};${contact.firstName || ""};;;
ORG:${contact.company || ""}
TITLE:${contact.title || ""}
TEL;TYPE=CELL,VOICE:${contact.phone || ""}
EMAIL;TYPE=PREF,INTERNET:${contact.email || ""}
URL:${contact.web || ""}
END:VCARD`;
}

// Initialize QR Code using current window URL
function initQRCode() {
  const qrContainer = document.getElementById('qrcode');
  // Use current window location as the QR payload
  const currentURL = window.location.href;

  qrCodeInstance = new QRCode(qrContainer, {
    text: currentURL,
    width: 180,
    height: 180,
    colorDark: "#070f24",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

// Toggle visibility of the QR code section
function toggleQRCode() {
  const qrSection = document.getElementById('qr-section');
  const toggleBtn = document.getElementById('toggle-qr-btn');
  const isHidden = qrSection.classList.toggle('hidden');
  
  if (isHidden) {
    toggleBtn.textContent = "Show QR Code";
    toggleBtn.classList.remove('active');
  } else {
    toggleBtn.textContent = "Hide QR Code";
    toggleBtn.classList.add('active');
    setTimeout(() => {
      qrSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

// Copy Contact Details to Clipboard
function copyToClipboard() {
  if (!contact.name) return;
  const textToCopy = `Name: ${contact.name}\nTitle: ${contact.title}\nCompany: ${contact.company}\nPhone: ${contact.phone}\nEmail: ${contact.email}\nWeb: ${contact.web}`;
  
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showToast("Contact Info Copied!");
    })
    .catch(err => {
      console.error("Failed to copy info: ", err);
      // Fallback
      const javaScriptTextArea = document.createElement("textarea");
      javaScriptTextArea.value = textToCopy;
      document.body.appendChild(javaScriptTextArea);
      javaScriptTextArea.select();
      try {
        document.execCommand('copy');
        showToast("Contact Info Copied!");
      } catch (err) {
        showToast("Error copying info");
      }
      document.body.removeChild(javaScriptTextArea);
    });
}

// Download dynamic vCard (.vcf) file
function downloadVCard() {
  if (!vCardString) return;
  try {
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(contact.name || 'contact').replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("vCard Downloaded!");
  } catch (error) {
    console.error("VCard download failed: ", error);
    showToast("Could not download vCard");
  }
}

// Custom Premium Toast Notification
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
