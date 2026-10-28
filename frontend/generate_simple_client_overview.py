import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PDF_ROOT = os.path.join(os.path.dirname(BASE_DIR), "Studio_Frangipani_Simple_Client_Overview.pdf")
OUTPUT_PDF_PUBLIC = os.path.join(BASE_DIR, "public", "Studio_Frangipani_Simple_Client_Overview.pdf")
OUTPUT_PDF_ARTIFACT = r"C:\Users\manme\.gemini\antigravity-ide\brain\888c427c-c849-4017-8634-9d37c15bbdac\Studio_Frangipani_Simple_Client_Overview.pdf"

class SimpleNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#737373"))
        
        # Header (page 2)
        if self._pageNumber > 1:
            self.drawString(50, 750, "STUDIO FRANGIPANI · PLATFORM ENHANCEMENTS SUMMARY")
            self.drawRightString(612 - 50, 750, "CLIENT OVERVIEW")
            self.setStrokeColor(colors.HexColor("#E5E5E5"))
            self.setLineWidth(0.5)
            self.line(50, 742, 612 - 50, 742)

        # Footer
        self.setFont("Helvetica", 8)
        self.drawString(50, 32, "Studio Frangipani · Operations & Digital Platform")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 50, 32, page_str)
        self.setStrokeColor(colors.HexColor("#E5E5E5"))
        self.setLineWidth(0.5)
        self.line(50, 44, 612 - 50, 44)
        self.restoreState()


def build_simple_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF_ROOT,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    c_charcoal = colors.HexColor("#1A1A1A")
    c_gold = colors.HexColor("#9E7A44")
    c_border = colors.HexColor("#E2E0DA")
    c_card_bg = colors.HexColor("#FDFCF9")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_charcoal,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=c_gold,
        spaceAfter=2
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_charcoal,
        spaceBefore=8,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#262626")
    )

    card_title = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=c_charcoal
    )

    card_desc = ParagraphStyle(
        'CardDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#4B5563")
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE, INTRO, AND WHAT CUSTOMERS EXPERIENCE
    # =========================================================================
    story.append(Paragraph("STUDIO FRANGIPANI · LUXURY PROP ATELIER", subtitle_style))
    story.append(Paragraph("Website Upgrades: What Changed & How It Works", title_style))
    story.append(Paragraph("<b>A quick, plain-English overview for the studio team</b>", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_gold, spaceBefore=4, spaceAfter=8))

    intro_text = (
        "This summary outlines the new operational tools and client-facing features added to the Studio Frangipani "
        "platform. These enhancements make it effortless for stylists and production houses to request props, "
        "enable direct communication over WhatsApp, and provide your team with full control over warehouse stock."
    )
    story.append(Paragraph(intro_text, body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Part 1: What Your Customers & Stylists Experience", h1_style))
    story.append(Paragraph("Stylists and art directors now have 5 simple improvements when exploring props:", body_style))
    story.append(Spacer(1, 4))

    customer_points = [
        [
            Paragraph("1. Product Codes (SKU) on Every Prop", card_title),
            Paragraph("Every piece now has a short studio code (like <b>SF-BRS-001</b>). Stylists can easily quote this on call sheets, emails, or phone calls.", card_desc)
        ],
        [
            Paragraph("2. Live Stock Badges (In Stock / Low Stock)", card_title),
            Paragraph("Customers clearly see if an item is available before enquiring, preventing disappointment.", card_desc)
        ],
        [
            Paragraph("3. Quantity Buttons (+ and -)", card_title),
            Paragraph("Stylists can now easily choose <b>2, 4, or 10 pieces</b> of an item (e.g. dinner sets or vases) instead of just one at a time.", card_desc)
        ],
        [
            Paragraph("4. One-Click 'Chat on WhatsApp'", card_title),
            Paragraph("A direct button that opens WhatsApp with the prop name, photo, dates, and price already written. The customer just presses 'Send'.", card_desc)
        ],
        [
            Paragraph("5. Simple Multi-Prop Enquiry Cart", card_title),
            Paragraph("Clients can select multiple props across the website, add their shoot dates, and submit. They instantly get a booking reference code (like <b>ENQ-2026-3020</b>).", card_desc)
        ],
    ]

    t_cust = Table(customer_points, colWidths=[165, 347])
    t_cust.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 6.5),
    ]))
    story.append(t_cust)
    story.append(Spacer(1, 10))

    # Crucial Rule Box
    rule_box = (
        "<b>Important Business Safety Feature:</b><br/>"
        "Submitting a cart does <b>NOT</b> lock up your stock. "
        "Casual website visitors browsing for fun cannot block real paying clients from renting items. "
        "Stock is only committed when <b>you</b> review the request and click 'Confirm' in your dashboard."
    )
    story.append(Table([[Paragraph(rule_box, body_style)]], colWidths=[512], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F7F5F0")),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: ADMIN TOOLS, HOW IT WORKS, AND WRAP-UP
    # =========================================================================
    story.append(Paragraph("Part 2: What Your Team Gets in the Admin Dashboard", h1_style))
    story.append(Paragraph("Behind the scenes, we built tools to make your daily operations effortless:", body_style))
    story.append(Spacer(1, 4))

    admin_points = [
        [
            Paragraph("1. The Inventory Shield: Never Double-Book a Prop", card_title),
            Paragraph("You always see 3 simple numbers for every prop in your atelier:<br/>"
                      "• <b>On-Hand:</b> Total physical pieces in your warehouse.<br/>"
                      "• <b>Reserved:</b> Pieces promised to upcoming confirmed bookings.<br/>"
                      "• <b>Available:</b> What you can safely rent out right now.<br/>"
                      "<b>The Safety Guard:</b> If someone tries to book 4 pieces but you only have 2 available, the system immediately stops you from over-booking.", card_desc)
        ],
        [
            Paragraph("2. Two Inboxes in One Place (Website + WhatsApp)", card_title),
            Paragraph("Under <b>/admin/enquiries</b>, you have two coordinated tabs:<br/>"
                      "• <b>Website Enquiries:</b> All website submissions sorted into clear stages (New → Quoted → Confirmed). 1-click to confirm, dispatch, or return.<br/>"
                      "• <b>WhatsApp Live Chat:</b> Read and reply to customer WhatsApp messages directly inside your admin panel. Includes 1-click professional reply templates.", card_desc)
        ],
        [
            Paragraph("3. Smart Customer Recognition", card_title),
            Paragraph("If a client fills out a website form and later messages you on WhatsApp, the system automatically matches their phone number and shows their booking request right inside the chat!", card_desc)
        ],
        [
            Paragraph("4. 1-Click Excel / CSV Reports", card_title),
            Paragraph("Download complete stock lists and rental movement history anytime with one click for tax audits, inventory counts, or insurance.", card_desc)
        ],
    ]

    t_admin = Table(admin_points, colWidths=[165, 347])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 6.5),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Part 3: How a Rental Booking Works Now (In 3 Simple Steps)", h1_style))

    steps_data = [
        [Paragraph("Step 1: Client Inquires", card_title),
         Paragraph("The client builds a prop list on the website or clicks 'Chat on WhatsApp'. (Stock is safe and not deducted yet).", card_desc)],
        [Paragraph("Step 2: You Click 'Confirm'", card_title),
         Paragraph("You review the shoot dates in your admin dashboard. With one click on 'Confirm & Reserve', the pieces are locked for that shoot.", card_desc)],
        [Paragraph("Step 3: Dispatch & Return", card_title),
         Paragraph("When props leave for the shoot, click 'Dispatch'. When they return safely to your warehouse, click 'Return to Inventory'.", card_desc)],
    ]
    t_steps = Table(steps_data, colWidths=[130, 382])
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FBF9F5")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_steps)
    story.append(Spacer(1, 10))

    # Bottom Ready Box
    ready_box = (
        "<b>Summary:</b> Everything is built, tested, and passing with zero errors. "
        "Your website is 100% ready for showcase and daily commercial operations.<br/>"
        "<i>Studio Frangipani · Luxury Prop Atelier</i>"
    )
    story.append(Table([[Paragraph(ready_box, body_style)]], colWidths=[512], style=[
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F5F3EF")),
        ('BOX', (0,0), (-1,-1), 1, c_gold),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))

    doc.build(story, canvasmaker=SimpleNumberedCanvas)
    
    # Copy to public folder and artifact folder
    shutil.copyfile(OUTPUT_PDF_ROOT, OUTPUT_PDF_PUBLIC)
    try:
        shutil.copyfile(OUTPUT_PDF_ROOT, OUTPUT_PDF_ARTIFACT)
    except Exception as e:
        pass
    print("Clean Simple Client Overview PDF generated successfully.")

if __name__ == "__main__":
    build_simple_pdf()
