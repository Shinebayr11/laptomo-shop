# Имэйлийн монгол загварууд

Supabase → **Authentication → Emails → Templates** хэсэгт тавина.
Загвар тус бүрд **Subject** болон **Message body** гэсэн хоёр талбар байна.

`{{ .ConfirmationURL }}` зэрэг хаалт бүхий хэсгийг **бүү өөрчил** — Supabase
тэдгээрийг бодит холбоосоор солино.

---

## 1. Confirm signup

**Subject**

```
LS Tech Store — бүртгэлээ баталгаажуулна уу
```

**Message body**

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 8px;">
            <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#7c5cff;font-weight:600;">LS Tech Store</p>
            <h1 style="margin:14px 0 0;font-size:23px;line-height:1.35;color:#16151a;font-weight:700;">
              Тавтай морилно уу!
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 0;">
            <p style="margin:0;font-size:15px;line-height:1.65;color:#4a4854;">
              Та LS Tech Store дээр бүртгэл үүсгэлээ. Доорх товчийг дарж
              имэйл хаягаа баталгаажуулснаар нэвтрэх боломжтой болно.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:26px 32px 6px;">
            <a href="{{ .ConfirmationURL }}"
               style="display:inline-block;background:#16151a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:999px;">
              Бүртгэл баталгаажуулах
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 0;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#8a8794;">
              Товч ажиллахгүй бол энэ хаягийг хөтчийн хаягийн мөрөнд хуулна уу:
            </p>
            <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#7c5cff;word-break:break-all;">
              {{ .ConfirmationURL }}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 32px;">
            <p style="margin:0;padding-top:18px;border-top:1px solid #ececf1;font-size:12px;line-height:1.6;color:#a5a2ae;">
              Хэрэв та бүртгүүлээгүй бол энэ захидлыг үл тоомсорлоно уу.
              Ямар нэг үйлдэл хийх шаардлагагүй.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#a5a2ae;">
        LS Tech Store · Улаанбаатар
      </p>
    </td>
  </tr>
</table>
```

---

## 2. Reset password

**Subject**

```
LS Tech Store — нууц үг сэргээх
```

**Message body**

```html
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 8px;">
            <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#7c5cff;font-weight:600;">LS Tech Store</p>
            <h1 style="margin:14px 0 0;font-size:23px;line-height:1.35;color:#16151a;font-weight:700;">
              Нууц үг сэргээх
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 0;">
            <p style="margin:0;font-size:15px;line-height:1.65;color:#4a4854;">
              Таны бүртгэлийн нууц үгийг сэргээх хүсэлт ирлээ. Доорх товчийг
              дарж шинэ нууц үгээ тохируулна уу.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:26px 32px 6px;">
            <a href="{{ .ConfirmationURL }}"
               style="display:inline-block;background:#16151a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:999px;">
              Нууц үг шинэчлэх
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 0;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#8a8794;">
              Товч ажиллахгүй бол энэ хаягийг хөтчийн хаягийн мөрөнд хуулна уу:
            </p>
            <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#7c5cff;word-break:break-all;">
              {{ .ConfirmationURL }}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 32px;">
            <p style="margin:0;padding-top:18px;border-top:1px solid #ececf1;font-size:12px;line-height:1.6;color:#a5a2ae;">
              Хэрэв та энэ хүсэлтийг илгээгээгүй бол захидлыг үл тоомсорлоно уу.
              Таны нууц үг хэвээр хадгалагдана.
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#a5a2ae;">
        LS Tech Store · Улаанбаатар
      </p>
    </td>
  </tr>
</table>
```

---

## Тэмдэглэл

- Загварууд нь table болон inline style дээр бичигдсэн — Gmail, Outlook,
  Apple Mail бүгдэд зөв харагдана.
- Гадаад зураг, фонт ашиглаагүй тул spam шүүлтүүрт таагүй нөлөөлөхгүй.
- Өнгө: `#7c5cff` (accent), `#16151a` (товч). Брэндээ өөрчилвөл эндээс солино.
- Бусад загвар (Magic Link, Invite, Change Email) одоогоор ашиглагдахгүй байгаа
  тул хөндөх шаардлагагүй.
