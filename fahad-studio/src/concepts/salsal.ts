// SALSAL — concept luxury ceramics app (no real brand, products or prices).
// Copy and data for the UI screens rendered by compositions/ConceptScreen.tsx.
export const SALSAL = {
  brand: { ar: "صلصال", latin: "SALSAL", tagline: "CERAMICS ATELIER" },
  colors: { bone: "#EFEAE1", paper: "#F7F4EE", ink: "#1A1715", muted: "#8A8178", line: "#D9D1C4", clay: "#B5643C" },
  home: {
    eyebrow: "مجموعة الخريف ٢٠٢٦",
    title: "قطعٌ تُشكَّل\nباليد، ببطء",
    body: "خزف حجري يُحرق مرتين، بطلاءات تُخلط في المرسم.",
    cta: "استكشف المجموعة",
    hero: "assets/images/ceramics/moon-bone.jpg",
    heroName: "جرّة القمر",
  },
  products: [
    { id: "moon", name: "جرّة القمر", latin: "MOON JAR", price: "١٬٤٨٠", image: "assets/images/ceramics/moon-bone.jpg", glaze: "عظمي منقّط", height: "٣٢ سم" },
    { id: "bottle", name: "قارورة الحبر", latin: "INK BOTTLE", price: "٩٦٠", image: "assets/images/ceramics/bottle-ink.jpg", glaze: "أسود لامع", height: "٢٨ سم" },
    { id: "bowl", name: "صحن السِّلادون", latin: "CELADON BOWL", price: "٦٤٠", image: "assets/images/ceramics/bowl-celadon.jpg", glaze: "أخضر سلادون", height: "٩ سم" },
    { id: "cup", name: "كوب الطين", latin: "CLAY CUP", price: "١٨٠", image: "assets/images/ceramics/cup-clay.jpg", glaze: "طين خام", height: "١١ سم" },
  ],
  product: {
    id: "bottle",
    story: "شكلٌ واحد يُرمى على الدولاب، ثم يُغطّس في طلاء أسود عميق يلمع كالحبر.",
    specs: [
      { k: "الخامة", v: "خزف حجري" },
      { k: "الطلاء", v: "أسود لامع" },
      { k: "الارتفاع", v: "٢٨ سم" },
    ],
    swatches: ["#1C1A19", "#EEE8DC", "#A9B8A3", "#B5643C"],
    cta: "أضف إلى السلة",
    currency: "ر.س",
  },
  collection: { title: "المجموعة", chips: ["الكل", "جِرار", "صحون", "أكواب"] },
  tabs: ["الرئيسية", "المجموعة", "المرسم", "السلة"],
};
