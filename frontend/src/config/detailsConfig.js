/**
 * ============================================================================
 * 🏢 STUDIO / CLIENT MASTER DETAILS CONFIGURATION
 * ============================================================================
 * Edit ANY client or studio detail below in this single file.
 * Any change made here will update EVERYWHERE across the entire website & admin!
 *
 * 1. 🏷️ BRAND & IDENTITY (Name, initials, tagline, copyright)
 * 2. 📱 CONTACT & WHATSAPP (Phone, WhatsApp, email, auto-greeting)
 * 3. 📍 STUDIO LOCATION (Address, city, warehouse, business hours)
 * 4. 🌐 SOCIAL MEDIA LINKS (Instagram, Pinterest, Behance)
 * 5. ⚙️ ADMIN & META DEFAULTS (Admin name, reorder alert threshold, Meta WABA ID)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. 🏷️ BRAND & IDENTITY
// ----------------------------------------------------------------------------
export const STUDIO_NAME = "Studio Frangipani";
export const STUDIO_INITIALS = "SF";
export const STUDIO_TAGLINE = "A curated prop rental studio for photographers, filmmakers and stylists.";
export const STUDIO_SUBTITLE = "Prop Concierge & Styling Atelier";
export const COPYRIGHT_YEAR = "2026";

// ----------------------------------------------------------------------------
// 2. 📱 CONTACT & WHATSAPP (Change phone/email here)
// ----------------------------------------------------------------------------
// Phone number for click-to-call and WhatsApp links
// (Accepts any format: "+91 8767640931", "8767640931", "+1 415 555 2671", etc.)
export const PHONE_NUMBER = "+91 8767640931";

// Main public contact email
export const EMAIL = "studio@studiofrangipani.rentals";

// Internal admin / operations email
export const ADMIN_EMAIL = "admin@studiofrangipani.rentals";

// Default greeting pre-filled in customer WhatsApp chats
export const WHATSAPP_DEFAULT_GREETING = "Hi! I would like to enquire about your prop collection and rental availability.";

// ----------------------------------------------------------------------------
// 3. 📍 STUDIO LOCATION & OPERATING HOURS
// ----------------------------------------------------------------------------
export const ADDRESS_LINE_1 = "14 Atelier Lane";
export const ADDRESS_LINE_2 = "Bandra West, Mumbai 400050";
export const CITY = "Mumbai";
export const FULL_ADDRESS = `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`;
export const WAREHOUSE_LOCATION = "Main Studio Warehouse, Bandra West";
export const BUSINESS_HOURS = "Mon–Sat, 10am – 7pm IST";

// ----------------------------------------------------------------------------
// 4. 🌐 SOCIAL MEDIA LINKS
// ----------------------------------------------------------------------------
export const SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  pinterest: "https://pinterest.com",
  behance: "https://behance.net",
};

// ----------------------------------------------------------------------------
// 5. ⚙️ ADMIN & META DEFAULTS
// ----------------------------------------------------------------------------
export const ADMIN_NAME = "ADMIN (Manmeet)";
export const DEFAULT_REORDER_THRESHOLD = 2;
export const STORAGE_PROVIDER = "supabase";
export const META_PHONE_NUMBER_ID = "109845329841029";
export const META_WABA_ID = "983204918204912";
export const META_VERIFY_TOKEN = "frangipani_meta_verify_secret_2026";

// ----------------------------------------------------------------------------
// 6. 💬 PRE-WRITTEN WHATSAPP QUICK-REPLY MENU MESSAGES
// ----------------------------------------------------------------------------
// Users can choose, click, and send any of these pre-written messages directly.
// You can add, edit, reorder, or remove these options anytime right here!
export const WHATSAPP_QUICK_MENU = [
  {
    id: "avail",
    icon: "📦",
    label: "Check Prop Availability",
    desc: "Check if items are free for your shoot dates",
    message: "Hi Studio Frangipani, I would like to check the availability of some props for an upcoming shoot.",
  },
  {
    id: "catalog",
    icon: "📖",
    label: "Request Catalog & Rate Card",
    desc: "Get the complete PDF catalog and pricing sheet",
    message: "Hi Studio Frangipani! Could you please share your latest prop catalog and rental rate card?",
  },
  {
    id: "styling",
    icon: "🎨",
    label: "Custom Styling Consultation",
    desc: "Need curated pieces tailored to a shoot theme",
    message: "Hi! I am planning an upcoming shoot and would love some styling recommendations from your prop collection.",
  },
  {
    id: "delivery",
    icon: "🚚",
    label: "Delivery & Studio Pickup Info",
    desc: "Turnaround times, on-set delivery & Bandra pickup",
    message: "Hi Studio Frangipani, could you please share details regarding your delivery turnaround times and self-pickup options?",
  },
  {
    id: "urgent",
    icon: "⚡",
    label: "Urgent / Same-Day Shoot",
    desc: "Immediate prop booking for today or tomorrow",
    message: "URGENT: Hi Studio Frangipani, I have a shoot coming up immediately and need to confirm prop availability right away.",
  },
];

// ----------------------------------------------------------------------------
// AUTOMATIC HELPERS & PARSERS (No need to touch anything below)
// ----------------------------------------------------------------------------

/**
 * Extracts pure digits formatted for wa.me links (e.g. "918767640931")
 */
export const getCleanWhatsAppDigits = (raw = PHONE_NUMBER) => {
  const digits = String(raw).replace(/\D/g, "");
  // If 10 digits without country code, default to India (+91)
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

/**
 * Formats a clean human-readable phone string (e.g. "+91 8767640931")
 */
export const getDisplayPhone = (raw = PHONE_NUMBER) => {
  const trimmed = String(raw).trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = getCleanWhatsAppDigits(trimmed);
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
};

/**
 * Generates direct wa.me link with optional pre-filled message
 */
export const getWhatsAppLink = (message = "", phoneOverride = null) => {
  const number = getCleanWhatsAppDigits(phoneOverride || PHONE_NUMBER);
  const text = message || WHATSAPP_DEFAULT_GREETING;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

/**
 * Master aggregated configuration object
 */
export const STUDIO_CONFIG = {
  name: STUDIO_NAME,
  initials: STUDIO_INITIALS,
  tagline: STUDIO_TAGLINE,
  subtitle: STUDIO_SUBTITLE,
  copyrightYear: COPYRIGHT_YEAR,
  phone: getDisplayPhone(PHONE_NUMBER),
  whatsappNumber: getCleanWhatsAppDigits(PHONE_NUMBER),
  email: EMAIL,
  adminEmail: ADMIN_EMAIL,
  address: FULL_ADDRESS,
  addressLine1: ADDRESS_LINE_1,
  addressLine2: ADDRESS_LINE_2,
  city: CITY,
  warehouseLocation: WAREHOUSE_LOCATION,
  businessHours: BUSINESS_HOURS,
  greeting: WHATSAPP_DEFAULT_GREETING,
  quickMenu: WHATSAPP_QUICK_MENU,
  socials: SOCIAL_LINKS,
  admin: {
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phone: getDisplayPhone(PHONE_NUMBER),
    reorderThreshold: DEFAULT_REORDER_THRESHOLD,
    storageProvider: STORAGE_PROVIDER,
    phoneNumberId: META_PHONE_NUMBER_ID,
    wabaId: META_WABA_ID,
    verifyToken: META_VERIFY_TOKEN,
  },
};
