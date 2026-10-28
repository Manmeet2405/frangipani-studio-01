import { NextResponse } from "next/server";

/**
 * POST /api/enquiries
 * Implements Enquiry submission workflow (PDF Section 4 & 8):
 * - Server-side validation (name, mobile, consent)
 * - Anti-spam Honeypot check
 * - Reference ID generation (ENQ-2026-XXXX)
 * - Snapshot of product names/SKUs/quantities
 * - Stock safety: Does NOT decrement inventory on submission
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      mobile,
      email,
      company,
      message,
      notes,
      shootType,
      delivery,
      location,
      startDate,
      endDate,
      items,
      consent,
      _hp_check, // Honeypot field
    } = body;

    // 1. Honeypot check for spam mitigation
    if (_hp_check) {
      return NextResponse.json(
        { error: "Spam submission detected" },
        { status: 400 }
      );
    }

    // 2. Mandatory field validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 422 }
      );
    }

    if (!mobile || typeof mobile !== "string" || !mobile.trim()) {
      return NextResponse.json(
        { error: "Mobile number is required for enquiry confirmation" },
        { status: 422 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Explicit consent to be contacted via WhatsApp/phone is required" },
        { status: 422 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Enquiry cart cannot be empty" },
        { status: 422 }
      );
    }

    // 3. Normalize phone number (E.164 without special characters)
    const normalizedPhone = mobile.replace(/[^0-9]/g, "");

    // 4. Generate unique reference code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `ENQ-2026-${randomSuffix}`;

    // 5. Snapshot items without touching inventory balances
    const itemSnapshots = items.map((item) => ({
      propId: item.id || item.propId,
      sku: item.sku || "SF-PROP-000",
      name: item.name || item.propName || "Studio Prop",
      quantity: Math.max(1, Number(item.quantity) || 1),
      pricePerDay: Number(item.pricePerDay) || 0,
    }));

    const enquiryRecord = {
      id: reference,
      reference,
      customer: name.trim(),
      phone: mobile.trim(),
      normalizedPhone,
      email: (email || "").trim(),
      company: (company || "").trim(),
      shootType: shootType || "Editorial & Fashion",
      delivery: delivery || "Pickup at Studio Bandra",
      location: (location || "").trim(),
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      notes: (notes || message || "").trim(),
      items: itemSnapshots,
      status: "new",
      source: "website_enquiry_cart",
      consentTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        reference,
        message: "Enquiry submitted successfully. Our team will contact you shortly.",
        enquiry: enquiryRecord,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("API /api/enquiries error:", err);
    return NextResponse.json(
      { error: "Internal server error processing enquiry" },
      { status: 500 }
    );
  }
}
