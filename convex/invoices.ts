"use node";

// Standalone build bundles the AFM font data inline via a virtual filesystem,
// avoiding the `ENOENT: /var/task/data/Helvetica.afm` error you get with the
// default pdfkit entry in Convex's serverless Node runtime.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — standalone build has no shipped types
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface InvoiceTopping {
  name: string;
  price: number;
  tvaPercent: number;
}

interface InvoiceItem {
  name: string;
  price?: number;
  finalPrice: number;
  isFree?: boolean;
  tvaPercent: number;
  toppings: InvoiceTopping[];
}

interface InvoiceOrder {
  _id: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  type: "pickup" | "delivery" | "dine_in";
  address?: { street: string; city: string; zipCode: string; instructions?: string };
  billingAddress: { street: string; city: string; zipCode: string } | null;
  paymentMethod: "stripe" | "cash";
  paymentStatus: "unpaid" | "paid" | "failed";
  items: InvoiceItem[];
  totalPrice: number;
  deliveryFee?: number;
  promoCode?: string;
  discountAmount?: number;
  createdAt: number;
}

interface InvoiceInfo {
  legalName: string;
  legalForm?: string;
  siret: string;
  rcsCity?: string;
  rcsNumber?: string;
  shareCapital?: number;
  tvaIntraNumber: string;
  legalAddress: string;
  phone?: string;
  email?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Public action: generate the PDF invoice as base64
// ────────────────────────────────────────────────────────────────────────────

export const generateInvoicePdf = action({
  args: {
    orderId: v.id("orders"),
    adminToken: v.optional(v.string()),
    userToken: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ base64: string; filename: string; invoiceNumber: string }> => {
    const { order, info } = await ctx.runQuery(internal.invoicesInternal.prepareInvoiceData, {
      orderId: args.orderId,
      adminToken: args.adminToken,
      userToken: args.userToken,
    });

    const missing: string[] = [];
    if (!info.legalName) missing.push("Raison sociale");
    if (!info.siret) missing.push("SIRET");
    if (!info.tvaIntraNumber) missing.push("N° TVA intracommunautaire");
    if (!info.legalAddress) missing.push("Adresse du siège social");
    if (missing.length > 0) {
      throw new Error(
        `Mentions légales manquantes (${missing.join(", ")}). Configurez-les dans Paramètres → Mentions légales.`,
      );
    }

    const { invoiceNumber, invoicedAt } = await ctx.runMutation(
      internal.invoicesInternal.assignInvoiceNumber,
      { orderId: args.orderId },
    );

    const pdfBuffer = await buildInvoicePdf({
      order,
      info: info as InvoiceInfo,
      invoiceNumber,
      invoicedAt,
    });

    return {
      base64: pdfBuffer.toString("base64"),
      filename: `Facture-${invoiceNumber}.pdf`,
      invoiceNumber,
    };
  },
});

// ────────────────────────────────────────────────────────────────────────────
// PDF rendering with pdfkit
// ────────────────────────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function fmtDate(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(ts));
}

function typeLabel(type: InvoiceOrder["type"]): string {
  return type === "delivery" ? "Livraison" : type === "pickup" ? "À emporter" : "Sur place";
}

function paymentLabel(method: InvoiceOrder["paymentMethod"], status: InvoiceOrder["paymentStatus"]): string {
  const methodTxt = method === "stripe" ? "Carte bancaire" : "Espèces";
  const statusTxt = status === "paid" ? "Payé" : status === "failed" ? "Échec" : "Non réglé";
  return `${methodTxt} — ${statusTxt}`;
}

interface BuildArgs {
  order: InvoiceOrder;
  info: InvoiceInfo;
  invoiceNumber: string;
  invoicedAt: number;
}

function buildInvoicePdf(args: BuildArgs): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    try {
      drawInvoice(doc, args);
    } catch (e) {
      reject(e);
      return;
    }
    doc.end();
  });
}

// Colour palette (kept neutral so it prints well in B&W).
const COL = {
  ink: "#0f172a",        // slate-900
  text: "#1f2937",       // slate-800
  muted: "#64748b",      // slate-500
  hairline: "#e2e8f0",   // slate-200
  shade: "#f8fafc",      // slate-50
  shadeStrong: "#f1f5f9",// slate-100
  accent: "#0f172a",
};

function drawInvoice(doc: PDFKit.PDFDocument, { order, info, invoiceNumber, invoicedAt }: BuildArgs): void {
  const pageWidth = doc.page.width;
  const pageMargin = doc.page.margins.left;
  const contentWidth = pageWidth - pageMargin * 2;
  const rightX = pageWidth - pageMargin;

  // ════════════════════════════════════════════════════════════════════════
  // HEADER BAND — restaurant identity left, invoice title right
  // ════════════════════════════════════════════════════════════════════════

  let y = 40;
  doc.fillColor(COL.ink).font("Helvetica-Bold").fontSize(20).text(info.legalName, pageMargin, y);
  doc.fontSize(9).font("Helvetica").fillColor(COL.muted);
  const legalLines: string[] = [];
  if (info.legalForm && info.shareCapital) {
    legalLines.push(`${info.legalForm} au capital de ${fmtEur(info.shareCapital)}`);
  } else if (info.legalForm) {
    legalLines.push(info.legalForm);
  }
  legalLines.push(info.legalAddress);
  if (info.siret) legalLines.push(`SIRET ${info.siret}`);
  if (info.rcsCity && info.rcsNumber) legalLines.push(`RCS ${info.rcsCity} ${info.rcsNumber}`);
  if (info.tvaIntraNumber) legalLines.push(`TVA ${info.tvaIntraNumber}`);
  if (info.phone) legalLines.push(info.phone);
  doc.text(legalLines.join("\n"), pageMargin, y + 26, { width: contentWidth * 0.6 });

  // Invoice title block (right)
  doc.fillColor(COL.ink).fontSize(28).font("Helvetica-Bold")
    .text("FACTURE", pageMargin, y, { width: contentWidth, align: "right" });
  doc.fontSize(10).font("Helvetica").fillColor(COL.text);
  doc.text(`N° ${invoiceNumber}`, pageMargin, y + 38, { width: contentWidth, align: "right" });
  doc.fillColor(COL.muted).fontSize(9);
  doc.text(`Émise le ${fmtDate(invoicedAt)}`, pageMargin, y + 54, { width: contentWidth, align: "right" });
  doc.text(`Date de vente : ${fmtDate(order.createdAt)}`, pageMargin, y + 67, {
    width: contentWidth,
    align: "right",
  });

  y = Math.max(doc.y, 140);
  doc.moveTo(pageMargin, y).lineTo(rightX, y).strokeColor(COL.hairline).lineWidth(0.8).stroke();
  y += 18;

  // ════════════════════════════════════════════════════════════════════════
  // TWO-COLUMN CARDS — Facturé à (left) | Commande (right)
  // ════════════════════════════════════════════════════════════════════════

  const cardGap = 14;
  const cardWidth = (contentWidth - cardGap) / 2;
  const leftCardX = pageMargin;
  const rightCardX = pageMargin + cardWidth + cardGap;

  // Build both card bodies first so we can measure & draw equal-height boxes.
  const billingLines: string[] = [];
  billingLines.push(`${order.customer.firstName} ${order.customer.lastName}`);
  if (order.billingAddress) {
    billingLines.push(order.billingAddress.street);
    billingLines.push(`${order.billingAddress.zipCode} ${order.billingAddress.city}`);
  }
  if (order.customer.phone) billingLines.push(`Tél. ${order.customer.phone}`);
  if (order.customer.email) billingLines.push(order.customer.email);

  const orderMetaRows: Array<[string, string]> = [
    ["Commande", `#${order._id.slice(-6).toUpperCase()}`],
    ["Type", typeLabel(order.type)],
  ];

  const cardPadding = 12;
  const labelHeight = 12;
  const lineHeight = 13;
  const leftBodyHeight = billingLines.length * lineHeight;
  const rightBodyHeight = orderMetaRows.length * lineHeight;
  const cardHeight = cardPadding * 2 + labelHeight + 4 + Math.max(leftBodyHeight, rightBodyHeight);

  // Left card — Facturé à
  drawCard(doc, leftCardX, y, cardWidth, cardHeight);
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8)
    .text("FACTURÉ À", leftCardX + cardPadding, y + cardPadding, { characterSpacing: 1 });
  doc.fillColor(COL.text).font("Helvetica").fontSize(10);
  let lineY = y + cardPadding + labelHeight + 4;
  doc.font("Helvetica-Bold").text(billingLines[0], leftCardX + cardPadding, lineY, { width: cardWidth - cardPadding * 2 });
  doc.font("Helvetica");
  for (let i = 1; i < billingLines.length; i++) {
    doc.text(billingLines[i], leftCardX + cardPadding, lineY + i * lineHeight, {
      width: cardWidth - cardPadding * 2,
    });
  }

  // Right card — Commande (label / value rows)
  drawCard(doc, rightCardX, y, cardWidth, cardHeight);
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8)
    .text("COMMANDE", rightCardX + cardPadding, y + cardPadding, { characterSpacing: 1 });
  lineY = y + cardPadding + labelHeight + 4;
  doc.fontSize(10);
  for (let i = 0; i < orderMetaRows.length; i++) {
    const [label, value] = orderMetaRows[i];
    const rowY = lineY + i * lineHeight;
    doc.fillColor(COL.muted).font("Helvetica").text(label, rightCardX + cardPadding, rowY, { width: 70 });
    doc.fillColor(COL.text).font("Helvetica-Bold")
      .text(value, rightCardX + 70 + cardPadding, rowY, {
        width: cardWidth - 70 - cardPadding * 2,
      });
  }

  y += cardHeight + 22;

  // ════════════════════════════════════════════════════════════════════════
  // ITEMS TABLE — Désignation | TVA | Qté | Prix unit. HT | Total HT
  // ════════════════════════════════════════════════════════════════════════

  const colDesc = pageMargin;
  const colQty = rightX - 200;
  const colUnit = rightX - 145;
  const colTotal = rightX - 70;
  const colDescWidth = colQty - pageMargin - 8;

  // Table header
  doc.rect(pageMargin, y, contentWidth, 22).fillColor(COL.shadeStrong).fill();
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8);
  doc.text("DÉSIGNATION", colDesc + 8, y + 7, { characterSpacing: 0.8 });
  doc.text("QTÉ", colQty, y + 7, { width: 40, align: "right", characterSpacing: 0.8 });
  doc.text("PRIX UNIT. HT", colUnit, y + 7, { width: 70, align: "right", characterSpacing: 0.8 });
  doc.text("TOTAL HT", colTotal, y + 7, { width: 65, align: "right", characterSpacing: 0.8 });
  y += 26;

  doc.font("Helvetica").fontSize(9.5);

  for (const item of order.items) {
    const itemRate = item.tvaPercent;
    const itemTtc = item.isFree ? 0 : (item.price ?? item.finalPrice);
    const itemHt = itemTtc / (1 + itemRate / 100);

    const rowTop = y;
    doc.fillColor(COL.text).font("Helvetica-Bold")
      .text(item.name, colDesc + 8, rowTop, { width: colDescWidth });
    const descEndY = doc.y;
    doc.font("Helvetica").fillColor(COL.muted);
    doc.text("1", colQty, rowTop, { width: 40, align: "right" });
    doc.fillColor(COL.text);
    doc.text(item.isFree ? "—" : fmtEur(itemHt), colUnit, rowTop, { width: 70, align: "right" });
    doc.font("Helvetica-Bold")
      .text(item.isFree ? "OFFERT" : fmtEur(itemHt), colTotal, rowTop, { width: 65, align: "right" });
    doc.font("Helvetica");
    y = Math.max(descEndY, rowTop + lineHeight);

    for (const t of item.toppings) {
      const tRate = t.tvaPercent;
      const tTtc = t.price ?? 0;
      const tStart = y;
      if (tTtc <= 0) {
        doc.fillColor(COL.muted).fontSize(9)
          .text(`•  ${t.name}`, colDesc + 18, tStart, { width: colDescWidth - 10 });
        y = doc.y;
        doc.fontSize(9.5);
        continue;
      }
      const tHt = tTtc / (1 + tRate / 100);
      doc.fillColor(COL.muted).fontSize(9)
        .text(`•  ${t.name}`, colDesc + 18, tStart, { width: colDescWidth - 10 });
      const tEnd = doc.y;
      doc.text("1", colQty, tStart, { width: 40, align: "right" });
      doc.text(fmtEur(tHt), colUnit, tStart, { width: 70, align: "right" });
      doc.text(fmtEur(tHt), colTotal, tStart, { width: 65, align: "right" });
      doc.fontSize(9.5);
      y = Math.max(tEnd, tStart + lineHeight);
    }

    doc.moveTo(pageMargin, y + 4).lineTo(rightX, y + 4).strokeColor(COL.hairline).lineWidth(0.4).stroke();
    y += 10;
  }

  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // TVA breakdown + totals (two columns)
  // ════════════════════════════════════════════════════════════════════════

  const tvaBuckets: Record<number, number> = {};
  for (const item of order.items) {
    const base = item.isFree ? 0 : (item.price ?? item.finalPrice);
    tvaBuckets[item.tvaPercent] = (tvaBuckets[item.tvaPercent] ?? 0) + base;
    for (const t of item.toppings) {
      const p = t.price ?? 0;
      if (p <= 0) continue;
      tvaBuckets[t.tvaPercent] = (tvaBuckets[t.tvaPercent] ?? 0) + p;
    }
  }
  if (order.deliveryFee && order.deliveryFee > 0) {
    tvaBuckets[10] = (tvaBuckets[10] ?? 0) + order.deliveryFee;
  }
  const discount = order.discountAmount ?? 0;
  if (discount > 0) {
    const ttcBefore = Object.values(tvaBuckets).reduce((s, v) => s + v, 0);
    if (ttcBefore > 0) {
      for (const rate of Object.keys(tvaBuckets)) {
        const r = Number(rate);
        tvaBuckets[r] = Math.max(0, tvaBuckets[r] - (tvaBuckets[r] / ttcBefore) * discount);
      }
    }
  }
  const rates = Object.keys(tvaBuckets).map(Number).sort((a, b) => a - b);

  const tvaX = pageMargin;
  const tvaWidth = contentWidth * 0.48;
  const totalsX = pageMargin + tvaWidth + cardGap;
  const totalsWidth = contentWidth - tvaWidth - cardGap;
  const tvaStart = y;

  // TVA breakdown (left)
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8)
    .text("DÉTAIL DE LA TVA", tvaX, y, { characterSpacing: 1 });
  y += 14;
  doc.rect(tvaX, y, tvaWidth, 18).fillColor(COL.shade).fill();
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8);
  const tvaColWidth = (tvaWidth - 16) / 4;
  doc.text("Taux", tvaX + 8, y + 5, { width: tvaColWidth, align: "left" });
  doc.text("Base HT", tvaX + 8 + tvaColWidth, y + 5, { width: tvaColWidth, align: "right" });
  doc.text("TVA", tvaX + 8 + tvaColWidth * 2, y + 5, { width: tvaColWidth, align: "right" });
  doc.text("Total TTC", tvaX + 8 + tvaColWidth * 3, y + 5, { width: tvaColWidth, align: "right" });
  y += 20;

  doc.font("Helvetica").fontSize(9).fillColor(COL.text);
  let grandHT = 0;
  let grandTVA = 0;
  for (const rate of rates) {
    const ttc = tvaBuckets[rate];
    if (ttc <= 0.005) continue;
    const ht = ttc / (1 + rate / 100);
    const tva = ttc - ht;
    grandHT += ht;
    grandTVA += tva;
    doc.text(`${rate}%`, tvaX + 8, y, { width: tvaColWidth, align: "left" });
    doc.text(fmtEur(ht), tvaX + 8 + tvaColWidth, y, { width: tvaColWidth, align: "right" });
    doc.text(fmtEur(tva), tvaX + 8 + tvaColWidth * 2, y, { width: tvaColWidth, align: "right" });
    doc.text(fmtEur(ttc), tvaX + 8 + tvaColWidth * 3, y, { width: tvaColWidth, align: "right" });
    y += 14;
  }

  // Totals (right) — render in parallel; advance y to max of both columns
  const totalsBodyY = tvaStart + 14;
  let ty = totalsBodyY;
  doc.fillColor(COL.muted).font("Helvetica-Bold").fontSize(8)
    .text("RÉCAPITULATIF", totalsX, tvaStart, { characterSpacing: 1 });

  const drawTotalRow = (label: string, value: string, opts: { bold?: boolean; color?: string } = {}) => {
    doc.fillColor(opts.color ?? COL.text).fontSize(10);
    doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
      .text(label, totalsX, ty, { width: totalsWidth - 6 });
    doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
      .text(value, totalsX, ty, { width: totalsWidth - 6, align: "right" });
    ty += 14;
  };

  if (order.deliveryFee && order.deliveryFee > 0) {
    drawTotalRow("Frais de livraison (TTC)", fmtEur(order.deliveryFee));
  }
  if (discount > 0) {
    drawTotalRow(order.promoCode ? `Remise (${order.promoCode})` : "Remise", `- ${fmtEur(discount)}`);
  }
  drawTotalRow("Total HT", fmtEur(grandHT));
  drawTotalRow("Total TVA", fmtEur(grandTVA));
  ty += 4;
  doc.rect(totalsX, ty, totalsWidth, 28).fillColor(COL.accent).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(12);
  doc.text("TOTAL TTC", totalsX + 12, ty + 9, { width: totalsWidth - 24 });
  doc.text(fmtEur(order.totalPrice), totalsX + 12, ty + 9, { width: totalsWidth - 24, align: "right" });
  ty += 36;

  y = Math.max(y, ty);

  // ════════════════════════════════════════════════════════════════════════
  // FOOTER — legal mentions
  // ════════════════════════════════════════════════════════════════════════

  doc.fillColor(COL.text);

  const footerY = doc.page.height - doc.page.margins.bottom - 56;
  doc.moveTo(pageMargin, footerY - 10).lineTo(rightX, footerY - 10)
    .strokeColor(COL.hairline).lineWidth(0.5).stroke();
  doc.fontSize(8).font("Helvetica").fillColor(COL.muted);
  doc.text(
    "En cas de retard de paiement, application de pénalités au taux d'intérêt légal majoré de 10 points, " +
      "et d'une indemnité forfaitaire pour frais de recouvrement de 40 € (art. L441-10 du Code de commerce). " +
      "Pas d'escompte pour paiement anticipé.",
    pageMargin,
    footerY,
    { width: contentWidth, align: "justify" },
  );
  doc.fontSize(7)
    .text(
      `Facture N° ${invoiceNumber} — ${info.legalName}`,
      pageMargin,
      doc.page.height - doc.page.margins.bottom - 12,
      { width: contentWidth, align: "center" },
    );
  doc.fillColor("#000000");
}

function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number): void {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fillAndStroke(COL.shade, COL.hairline);
  doc.restore();
}
