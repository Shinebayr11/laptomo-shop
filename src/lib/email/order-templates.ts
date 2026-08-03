import { Order } from "@/types";
import { SITE } from "@/constants/site";
import { formatMNT } from "@/utils/format";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";

function itemRows(order: Order): string {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #ececf1;font-size:14px;color:#16151a;">
            ${escapeHtml(item.title)}
            <span style="color:#8a8794;"> × ${item.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #ececf1;font-size:14px;color:#16151a;text-align:right;white-space:nowrap;">
            ${formatMNT(item.price * item.quantity)}
          </td>
        </tr>`,
    )
    .join("");
}

/** Имэйл нь HTML тул хэрэглэгчийн оруулсан текстийг заавал escape хийнэ. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, badge: string, inner: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px;font-family:${FONT};">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;">
  <tr><td style="padding:32px 32px 8px;">
    <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#7c5cff;font-weight:600;">${badge}</p>
    <h1 style="margin:14px 0 0;font-size:22px;line-height:1.35;color:#16151a;">${title}</h1>
  </td></tr>
  ${inner}
  <tr><td style="padding:22px 32px 32px;">
    <p style="margin:0;padding-top:18px;border-top:1px solid #ececf1;font-size:12px;line-height:1.6;color:#a5a2ae;">
      ${SITE.name} · ${SITE.phone}<br>
      <a href="${SITE.url}" style="color:#7c5cff;text-decoration:none;">${SITE.url.replace(/^https?:\/\//, "")}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>`;
}

/** Худалдан авагчид явах баталгаа. */
export function customerOrderEmail(order: Order): {
  subject: string;
  html: string;
} {
  const inner = `
  <tr><td style="padding:14px 32px 0;">
    <p style="margin:0;font-size:15px;line-height:1.65;color:#4a4854;">
      Сайн байна уу, ${escapeHtml(order.customer_name)}.<br>
      Таны захиалгыг хүлээн авлаа. Бид тантай удахгүй холбогдоно.
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:#8a8794;">
      Захиалгын дугаар: <span style="color:#16151a;font-weight:600;">${escapeHtml(order.id)}</span>
    </p>
  </td></tr>
  <tr><td style="padding:20px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order)}
      <tr>
        <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#16151a;">Нийт</td>
        <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#16151a;text-align:right;">${formatMNT(order.total_price)}</td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 0;">
    <p style="margin:0;font-size:13px;line-height:1.7;color:#8a8794;">
      Хүргэлтийн хаяг: <span style="color:#16151a;">${escapeHtml(order.address)}</span><br>
      Утас: <span style="color:#16151a;">${escapeHtml(order.customer_phone)}</span>
    </p>
  </td></tr>
  <tr><td align="center" style="padding:24px 32px 0;">
    <a href="${SITE.url}/account"
       style="display:inline-block;background:#16151a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 30px;border-radius:999px;">
      Захиалгын явц харах
    </a>
  </td></tr>`;

  return {
    subject: `Захиалга ${order.id} хүлээн авлаа — ${SITE.name}`,
    html: shell("Захиалга баталгаажлаа", SITE.name, inner),
  };
}

/** Дэлгүүрийн эзэнд явах мэдэгдэл. */
export function adminOrderEmail(order: Order): {
  subject: string;
  html: string;
} {
  const inner = `
  <tr><td style="padding:14px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.8;color:#4a4854;">
      <tr><td style="width:110px;color:#8a8794;">Дугаар</td><td style="color:#16151a;font-weight:600;">${escapeHtml(order.id)}</td></tr>
      <tr><td style="color:#8a8794;">Хэрэглэгч</td><td style="color:#16151a;">${escapeHtml(order.customer_name)}</td></tr>
      <tr><td style="color:#8a8794;">Утас</td><td style="color:#16151a;">${escapeHtml(order.customer_phone)}</td></tr>
      <tr><td style="color:#8a8794;">Хаяг</td><td style="color:#16151a;">${escapeHtml(order.address)}</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemRows(order)}
      <tr>
        <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#16151a;">Нийт</td>
        <td style="padding:14px 0 0;font-size:15px;font-weight:600;color:#16151a;text-align:right;">${formatMNT(order.total_price)}</td>
      </tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:24px 32px 0;">
    <a href="${SITE.url}/admin/orders"
       style="display:inline-block;background:#16151a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 30px;border-radius:999px;">
      Админ самбар нээх
    </a>
  </td></tr>`;

  return {
    subject: `🛒 Шинэ захиалга ${order.id} · ${formatMNT(order.total_price)}`,
    html: shell("Шинэ захиалга", "Мэдэгдэл", inner),
  };
}
