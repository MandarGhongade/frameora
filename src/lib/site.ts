// Change your brand here — it updates everywhere on the site.
export const site = {
  name: "Frameora",
  tagline: "Your moments, beautifully framed.",
  email: "hello@frameora.in",
  whatsapp: "+91 90000 00000",
  freeShippingAbove: 999,
  shippingFee: 79,
  codFee: 49,
};

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
