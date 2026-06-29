import { useState, useEffect, useRef } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  cream: "#FAF8F5",
  beige: "#F0EDE7",
  beigeD: "#E4DFD6",
  sage: "#7BA794",
  sageL: "#A8C4B8",
  sageXL: "#E8F2EE",
  blue: "#6B9EBF",
  blueL: "#C8DFF0",
  blueXL: "#EDF5FB",
  lila: "#9B8EC4",
  lilaL: "#D4CEEE",
  lilaXL: "#F0EEF9",
  peach: "#E8956D",
  peachL: "#F5C9B0",
  peachXL: "#FDF0E8",
  red: "#D4463A",
  redL: "#F5C5C2",
  redXL: "#FEF2F1",
  text: "#2C2C2C",
  textM: "#5C5C5C",
  textL: "#9C9C9C",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.06)",
  shadowM: "rgba(0,0,0,0.12)",
};

// ============================================================
// MOCK DATA STORE (simulates backend)
// ============================================================
const initChild = {
  id: "child_1",
  name: "Elif",
  birthDate: "2023-03-15",
  gender: "kız",
  bloodType: "A+",
  weight: 11.2,
  height: 79,
  allergies: ["Fıstık"],
  chronicConditions: [],
  doctorInfo: { name: "Dr. Ayşe Kaya", phone: "0212 555 00 11" },
  emergencyContact: { name: "Büyükanne Fatma", phone: "0532 111 22 33" },
};

const initEvents = [
  { id: "e1", type: "sleep", title: "Gece uykusu", value: "20:30–06:45", dateTime: new Date(Date.now() - 36e5 * 3).toISOString(), note: "" },
  { id: "e2", type: "feed", title: "Kahvaltı", value: "Yoğurt, muz", dateTime: new Date(Date.now() - 36e5 * 4).toISOString(), note: "" },
  { id: "e3", type: "fever", title: "Ateş ölçümü", value: "37.2°C", dateTime: new Date(Date.now() - 36e5 * 5).toISOString(), note: "Normal" },
  { id: "e4", type: "diaper", title: "Bez değişimi", value: "Kaka", dateTime: new Date(Date.now() - 36e5 * 6).toISOString(), note: "" },
];

const initMeds = [
  { id: "m1", name: "D Vitamini", doctorName: "Dr. Ayşe Kaya", dosageText: "400 IU", frequencyText: "Günde 1", startDate: "2024-01-01", endDate: "", reminderEnabled: true, notes: "Sabah kahvaltı ile" },
];

const initVaccines = [
  { id: "v1", vaccineName: "Hepatit B 1. Doz", plannedDate: "2023-03-15", completedDate: "2023-03-15", sideEffects: "Hafif kızarıklık" },
  { id: "v2", vaccineName: "BCG", plannedDate: "2023-03-20", completedDate: "2023-03-20", sideEffects: "" },
  { id: "v3", vaccineName: "6'lı Karma 1. Doz", plannedDate: "2023-05-15", completedDate: "2023-05-15", sideEffects: "Hafif ateş" },
  { id: "v4", vaccineName: "6'lı Karma 2. Doz", plannedDate: "2023-07-15", completedDate: "2023-07-15", sideEffects: "" },
  { id: "v5", vaccineName: "Kızamık-Kızamıkçık-Kabakulak", plannedDate: "2024-03-15", completedDate: "", sideEffects: "" },
];

const initDoctorVisits = [
  { id: "d1", doctorName: "Dr. Ayşe Kaya", visitDate: "2024-11-10", complaint: "Öksürük, burun akıntısı", diagnosisText: "Üst solunum yolu enfeksiyonu", recommendation: "Bol sıvı, istirahat. 3 gün içinde geçmezse tekrar gel.", attachments: [] },
];

const milestones = [
  { age: "2 ay", label: "Gülümseme", category: "Sosyal", done: true },
  { age: "4 ay", label: "Başını tutma", category: "Kaba Motor", done: true },
  { age: "6 ay", label: "Oturma (destekle)", category: "Kaba Motor", done: true },
  { age: "9 ay", label: "Emekleme", category: "Kaba Motor", done: true },
  { age: "12 ay", label: "İlk adım", category: "Kaba Motor", done: false },
  { age: "12 ay", label: "İlk kelime", category: "Dil", done: false },
  { age: "18 ay", label: "Kaşık kullanma", category: "Öz Bakım", done: false },
  { age: "24 ay", label: "2 kelimeli cümle", category: "Dil", done: false },
];

// ============================================================
// AI MOCK ENGINE
// ============================================================
async function askAI(question, childData, events) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

  const q = question.toLowerCase();
  const childAge = Math.floor((new Date() - new Date(childData.birthDate)) / (365.25 * 24 * 3600 * 1000) * 12);

  // Pattern matching for realistic responses
  if (q.includes("ateş") || q.includes("ates")) {
    if (q.includes("38") || q.includes("39") || q.includes("yüksek")) {
      return {
        text: `${childData.name}'in ateşi için kayıtlarına baktım. Son ölçümünde 37.2°C görüyorum.\n\n**Şu an için:**\n• ${childData.name} ${childAge} aylık. Bu yaşta 38°C altı ateş genellikle takip gerektirir.\n• Bol sıvı alımını sağlayın (su, ıhlamur).\n• Ateş 38.5°C üzerine çıkarsa giysileri hafifletin.\n• ${childData.name}'in geçmişinde üst solunum yolu enfeksiyonu kaydı var. Burun akıntısı veya öksürük eşlik ediyor mu?\n\n**Ne zaman doktora?**\n→ Ateş 39°C üzerine çıkarsa\n→ 3 günden uzun sürerse\n→ Peteşi/döküntü eşlik ederse\n→ Genel durumu belirgin kötüleşirse\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
        flags: [],
      };
    }
    return {
      text: `${childData.name}'in ateşiyle ilgili kayıtlara baktım. Son ölçüm 37.2°C olarak görünüyor — bu normal sınırda.\n\n${childAge} aylık bir çocukta ateş takibi için: 30 dakikada bir ölçüm, bol sıvı ve rahat ortam önemli.\n\n**Ne zaman doktora?**\n→ 38°C üzeri ve genel durumda kötüleşme\n→ 3 aydan küçük bebekte herhangi bir ateş\n→ Ateşle birlikte döküntü, nefes darlığı\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
      flags: [],
    };
  }

  if (q.includes("uyku") || q.includes("uyumuyor") || q.includes("gece")) {
    return {
      text: `${childData.name}'in uyku kayıtlarına baktım. ${childAge} aylık bir çocuk için gece 10-12 saat, gündüz 1-2 saat uyku normal kabul edilir.\n\n**Son 7 güne göre:**\nOrtalama uyku süresi yaklaşık 10.5 saat — bu yaşa uygun aralıkta.\n\n**Uyku rutini önerileri:**\n• Her gece aynı saatte uyku başlatın (±15 dakika)\n• Uyku öncesi sakinleştirici rutin: banyo → kitap → uyku\n• Odayı karanlık ve serin tutun (18-20°C)\n• Ekran süresini uyku öncesi 1 saat kısın\n\n**Dikkat:** Son 5 gün verisine göre uyku başlangıcı tutarsız. Rutin oluşturmanın faydası olabilir.\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
      flags: [],
    };
  }

  if (q.includes("beslenme") || q.includes("yemiyor") || q.includes("iştah") || q.includes("mama")) {
    return {
      text: `${childData.name}'in beslenme kayıtlarına baktım. ${childAge} aylık çocuklar için günde 3 ana öğün + 2 ara öğün standart kabul edilir.\n\n**Bugün için:** Kahvaltıda yoğurt ve muz kaydı görüyorum — bu iyi bir başlangıç.\n\n**${childAge} aylık için beslenme noktaları:**\n• Günde 500ml tam yağlı süt/süt ürünü\n• Her öğünde protein (et, yumurta, baklagil)\n• Renkli sebze ve meyve çeşitliliği\n• Yeterli demir kaynağı (kırmızı et, ıspanak)\n\n**İştah azlığında dikkat:**\n→ 5 günden uzun süren iştahsızlık\n→ Kilo kaybı veya durağanlaşma\n→ Genel durumda değişiklik\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
      flags: [],
    };
  }

  if (q.includes("aşı") || q.includes("asi")) {
    return {
      text: `${childData.name}'in aşı takvimine baktım.\n\n**Tamamlanan aşılar:** Hepatit B, BCG, 6'lı Karma (2 doz)\n**Bekleyen aşı:** Kızamık-Kızamıkçık-Kabakulak (KKK) — ${childData.name} 12 aylık olduğunda planlanmış.\n\n**Genel bilgi:**\nKKK aşısı genellikle 12-15. ayda yapılır. Aşı sonrası 7-14. günlerde hafif ateş ve döküntü görülebilir — bu normaldir.\n\n**Bir sonraki randevunuzda Dr. Ayşe Kaya'ya sorabileceğiniz sorular:**\n• KKK aşısı için en uygun gün ne zaman?\n• Aşı sonrası takip için ne önerirsiniz?\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
      flags: [],
    };
  }

  if (q.includes("gelişim") || q.includes("gelis") || q.includes("büyüme")) {
    return {
      text: `${childData.name}'in gelişim kaydına baktım. Şu an ${childAge} aylık, ${childData.weight} kg, ${childData.height} cm.\n\n**Kilometre taşları:** Emekleme tamamlanmış — harika! Sıradaki beklenen: ilk adımlar (9-15. ay arası normal).\n\n**Bugünkü gelişim aktivitesi önerisi:**\n🧱 **Kule Yıkma Oyunu** (10 dakika)\nSoft blokları üst üste koyun, ${childData.name}'in yıkmasını izleyin. Sonra birlikte koyun. Bu aktivite:\n• El-göz koordinasyonunu destekler\n• Neden-sonuç ilişkisi geliştirir\n• İnce motor becerilerini güçlendirir\n\n**Boy/kilo:** Kayıtlı değerler büyüme eğrisinde normal aralıkta görünüyor.\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
      flags: [],
    };
  }

  if (q.includes("acil") || q.includes("nefes") || q.includes("morar") || q.includes("havale") || q.includes("bilinç")) {
    return {
      text: `⚠️ **Bu durumda lütfen hemen harekete geçin.**\n\nBelirttiğin semptomlar acil değerlendirme gerektirebilir.\n\n**Hemen 112'yi arayın veya en yakın acil servise gidin.**\n\n${childData.name}'in bilgilerini (kan grubu: ${childData.bloodType}, alerjiler: ${childData.allergies.join(", ")}) acil doktora bildirin.\n\n*Acil tıbbi durumda uygulamayı değil, 112'yi kullanın.*`,
      flags: ["EMERGENCY"],
    };
  }

  // Default helpful response
  return {
    text: `Sorun için ${childData.name}'in kayıtlarına baktım (${childAge} aylık, ${childData.weight} kg).\n\nKayıtlarda bu konuyla ilgili özel bir veri göremiyorum, ancak genel olarak şunu söyleyebilirim:\n\nHer çocuğun gelişimi farklı bir tempoda ilerler. ${childData.name}'in mevcut kayıtlarına göre genel durumu normal görünüyor.\n\nDaha spesifik bir konuda yardımcı olmamı ister misiniz? Örneğin:\n• Uyku düzeni analizi\n• Beslenme önerileri\n• Gelişim aktiviteleri\n• Aşı takibi\n• Doktor randevusu özeti\n\n*Bu bilgi karar desteği içindir, tıbbi teşhis değildir.*`,
    flags: [],
  };
}

// ============================================================
// UTILITIES
// ============================================================
function getAge(birthDate) {
  const now = new Date();
  const birth = new Date(birthDate);
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 24) return `${months} aylık`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} yaş ${rem} ay` : `${years} yaş`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

const eventTypeConfig = {
  sleep:  { icon: "🌙", color: T.blue,   bgColor: T.blueXL,   label: "Uyku" },
  feed:   { icon: "🍽️", color: T.sage,   bgColor: T.sageXL,   label: "Beslenme" },
  fever:  { icon: "🌡️", color: T.peach,  bgColor: T.peachXL,  label: "Ateş" },
  diaper: { icon: "🧷", color: T.lila,   bgColor: T.lilaXL,   label: "Bez" },
  med:    { icon: "💊", color: T.peach,  bgColor: T.peachXL,  label: "İlaç" },
  note:   { icon: "📝", color: T.textM,  bgColor: T.beige,    label: "Not" },
  milestone: { icon: "⭐", color: T.sage, bgColor: T.sageXL,  label: "Gelişim" },
};

// ============================================================
// COMPONENTS
// ============================================================

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.white,
      borderRadius: 16,
      padding: 20,
      boxShadow: `0 2px 12px ${T.shadow}`,
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>{children}</div>
  );
}

function Tag({ color, bg, children }) {
  return (
    <span style={{ background: bg || T.beige, color: color || T.textM, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", small, style, disabled }) {
  const styles = {
    primary: { background: T.sage, color: T.white },
    secondary: { background: T.beige, color: T.text },
    danger: { background: T.redXL, color: T.red },
    ghost: { background: "transparent", color: T.sage, border: `1.5px solid ${T.sage}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      border: "none",
      borderRadius: 12,
      padding: small ? "8px 16px" : "12px 22px",
      fontSize: small ? 13 : 15,
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      fontFamily: "inherit",
      transition: "opacity 0.2s",
      ...style,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", multiline, required }) {
  const base = {
    width: "100%",
    border: `1.5px solid ${T.beigeD}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 15,
    fontFamily: "inherit",
    background: T.cream,
    color: T.text,
    outline: "none",
    boxSizing: "border-box",
    resize: multiline ? "vertical" : undefined,
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: T.textM, marginBottom: 6 }}>{label}{required && <span style={{ color: T.red }}> *</span>}</div>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} style={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: T.textM, marginBottom: 6 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", border: `1.5px solid ${T.beigeD}`, borderRadius: 10, padding: "10px 14px",
        fontSize: 15, fontFamily: "inherit", background: T.cream, color: T.text, outline: "none",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.white, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{title}</div>
          <button onClick={onClose} style={{ background: T.beige, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 16, color: T.textM }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// NAV ITEMS
// ============================================================
const navItems = [
  { id: "home",      icon: "🏠", label: "Ana Sayfa" },
  { id: "timeline",  icon: "📋", label: "Günlük" },
  { id: "ai",        icon: "✨", label: "Nuna AI" },
  { id: "health",    icon: "❤️", label: "Sağlık" },
  { id: "profile",   icon: "👶", label: "Profil" },
];

// ============================================================
// SCREENS
// ============================================================

// --- ONBOARDING ---
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [kvkk, setKvkk] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("kız");

  const steps = [
    {
      title: "Hoş geldiniz 👋",
      subtitle: "Nuna, çocuğunuzun sağlık ve gelişimini güvenle takip etmenizi sağlar.",
      content: (
        <div>
          <div style={{ textAlign: "center", margin: "32px 0" }}>
            <div style={{ fontSize: 80 }}>🌱</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.text, marginTop: 16 }}>Nuna</div>
            <div style={{ color: T.textM, marginTop: 8, lineHeight: 1.6 }}>Çocuğunuzu tanıyan,<br/>geçmişini bilen kişisel asistan.</div>
          </div>
          <Btn onClick={() => setStep(1)} style={{ width: "100%" }}>Başlayalım →</Btn>
        </div>
      ),
    },
    {
      title: "KVKK ve Gizlilik",
      content: (
        <div>
          <div style={{ background: T.sageXL, borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 14, color: T.textM, lineHeight: 1.7 }}>
            <strong style={{ color: T.text }}>Kişisel Verilerin Korunması</strong><br /><br />
            Bu uygulama çocuğunuza ait sağlık ve gelişim verilerini işler. Verileriniz yalnızca uygulama içi takip ve AI karar desteği için kullanılır. Hiçbir kişisel sağlık verisi reklam amacıyla kullanılmaz.<br /><br />
            <strong>Tıbbi Sorumluluk Reddi:</strong> Nuna tıbbi teşhis koymaz, tedavi önermez, ilaç başlatmaz veya kesmez. Acil durumlarda 112 veya en yakın sağlık kuruluşuna başvurun.<br /><br />
            Kullanıcı Sözleşmesi, Gizlilik Politikası ve KVKK Aydınlatma Metni'ni okudum.
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 20 }}>
            <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18 }} />
            <span style={{ fontSize: 14, color: T.text }}>Kişisel veri işlenmesine ve KVKK şartlarına açık rıza veriyorum.</span>
          </label>
          <Btn onClick={() => setStep(2)} disabled={!kvkk} style={{ width: "100%" }}>Kabul Ediyorum →</Btn>
        </div>
      ),
    },
    {
      title: "Hesabınızı oluşturun",
      content: (
        <div>
          <Input label="Ad Soyad" value={name} onChange={setName} placeholder="Adınız" required />
          <Input label="E-posta" value={email} onChange={setEmail} placeholder="email@örnek.com" type="email" required />
          <Btn onClick={() => name && email && setStep(3)} style={{ width: "100%" }}>Devam →</Btn>
        </div>
      ),
    },
    {
      title: "Çocuğunuzu tanıtalım",
      content: (
        <div>
          <Input label="Çocuğun adı" value={childName} onChange={setChildName} placeholder="Ad" required />
          <Input label="Doğum tarihi" value={birthDate} onChange={setBirthDate} type="date" required />
          <Select label="Cinsiyet" value={gender} onChange={setGender} options={[{ value: "kız", label: "Kız" }, { value: "erkek", label: "Erkek" }]} />
          <Btn onClick={() => childName && birthDate && onComplete({ name, email, childName, birthDate, gender })} style={{ width: "100%" }}>Nuna'yı Başlat 🌱</Btn>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.cream, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ marginBottom: 8, display: "flex", gap: 6 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 4, background: i <= step ? T.sage : T.beigeD }} />
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>{steps[step].title}</div>
        {steps[step].subtitle && <div style={{ color: T.textM, marginBottom: 24 }}>{steps[step].subtitle}</div>}
        {steps[step].content}
      </div>
    </div>
  );
}

// --- HOME ---
function HomeScreen({ child, events, onQuickAdd, onNav }) {
  const recentEvents = [...events].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)).slice(0, 4);
  const lastSleep = events.find(e => e.type === "sleep");
  const lastFever = events.find(e => e.type === "fever");
  const lastFeed = events.find(e => e.type === "feed");

  const quickActions = [
    { icon: "🌙", label: "Uyku", type: "sleep" },
    { icon: "🌡️", label: "Ateş", type: "fever" },
    { icon: "💊", label: "İlaç", type: "med" },
    { icon: "🍽️", label: "Beslenme", type: "feed" },
    { icon: "🧷", label: "Bez", type: "diaper" },
    { icon: "📝", label: "Not", type: "note" },
  ];

  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.sage} 0%, ${T.sageL} 100%)`, padding: "48px 24px 28px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            {child.gender === "kız" ? "👧" : "👦"}
          </div>
          <div>
            <div style={{ color: T.white, fontSize: 22, fontWeight: 700 }}>{child.name}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{getAge(child.birthDate)} · {child.weight} kg · {child.height} cm</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        {/* Today summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { icon: "🌙", label: "Son uyku", value: lastSleep ? lastSleep.value : "—", color: T.blue, bg: T.blueXL },
            { icon: "🌡️", label: "Son ateş", value: lastFever ? lastFever.value : "—", color: T.peach, bg: T.peachXL },
            { icon: "🍽️", label: "Son öğün", value: lastFeed ? "✓" : "—", color: T.sage, bg: T.sageXL },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 11, color: T.textM, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textM, marginBottom: 14 }}>Hızlı Kayıt</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {quickActions.map(a => (
              <button key={a.type} onClick={() => onQuickAdd(a.type)} style={{
                background: T.cream, border: `1.5px solid ${T.beigeD}`, borderRadius: 12, padding: "12px 6px",
                cursor: "pointer", textAlign: "center", fontFamily: "inherit",
              }}>
                <div style={{ fontSize: 22 }}>{a.icon}</div>
                <div style={{ fontSize: 12, color: T.textM, marginTop: 4, fontWeight: 600 }}>{a.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* AI Prompt */}
        <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${T.lilaXL} 0%, ${T.blueXL} 100%)`, border: `1px solid ${T.lilaL}` }} onClick={() => onNav("ai")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32 }}>✨</div>
            <div>
              <div style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>Nuna AI Asistan</div>
              <div style={{ color: T.textM, fontSize: 13, marginTop: 2 }}>{child.name}'in verisine göre soru sor</div>
            </div>
            <div style={{ marginLeft: "auto", color: T.lila, fontSize: 20 }}>→</div>
          </div>
        </Card>

        {/* Recent Events */}
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>Son Kayıtlar</div>
        {recentEvents.map(ev => {
          const cfg = eventTypeConfig[ev.type] || eventTypeConfig.note;
          return (
            <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.beige}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cfg.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 14 }}>{ev.title}</div>
                <div style={{ color: T.textM, fontSize: 12, marginTop: 2 }}>{ev.value}</div>
              </div>
              <div style={{ color: T.textL, fontSize: 12 }}>{formatTime(ev.dateTime)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- TIMELINE ---
function TimelineScreen({ events, onAdd }) {
  const sorted = [...events].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  const [filterType, setFilterType] = useState("all");
  const types = ["all", "sleep", "feed", "fever", "diaper", "med", "note"];

  const filtered = filterType === "all" ? sorted : sorted.filter(e => e.type === filterType);

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ padding: "48px 20px 16px", background: T.white, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 14 }}>Günlük Zaman Çizelgesi</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {types.map(t => {
            const cfg = t === "all" ? { icon: "📋", label: "Tümü", color: T.sage, bgColor: T.sageXL } : eventTypeConfig[t];
            const active = filterType === t;
            return (
              <button key={t} onClick={() => setFilterType(t)} style={{
                background: active ? T.sage : T.beige, color: active ? T.white : T.textM,
                border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
              }}>
                {cfg?.icon} {cfg?.label || "Tümü"}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <Btn onClick={onAdd} style={{ width: "100%", marginBottom: 16 }}>+ Kayıt Ekle</Btn>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: T.textL, padding: 40, fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            Henüz kayıt yok
          </div>
        )}

        {filtered.map(ev => {
          const cfg = eventTypeConfig[ev.type] || eventTypeConfig.note;
          return (
            <div key={ev.id} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cfg.icon}</div>
                <div style={{ width: 2, flex: 1, background: T.beigeD, marginTop: 6 }} />
              </div>
              <Card style={{ flex: 1, padding: 14, marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Tag color={cfg.color} bg={cfg.bgColor}>{cfg.label}</Tag>
                  <span style={{ fontSize: 12, color: T.textL }}>{formatTime(ev.dateTime)}</span>
                </div>
                <div style={{ fontWeight: 600, color: T.text, marginTop: 6 }}>{ev.title}</div>
                {ev.value && <div style={{ color: T.textM, fontSize: 13, marginTop: 2 }}>{ev.value}</div>}
                {ev.note && <div style={{ color: T.textL, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{ev.note}</div>}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- ADD EVENT MODAL ---
function AddEventModal({ open, onClose, onSave, defaultType }) {
  const [type, setType] = useState(defaultType || "note");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [naturalText, setNaturalText] = useState("");
  const [mode, setMode] = useState("quick");
  const [parsing, setParsing] = useState(false);

  useEffect(() => { if (open) { setType(defaultType || "note"); setTitle(""); setValue(""); setNote(""); setNaturalText(""); } }, [open, defaultType]);

  const typeOptions = Object.entries(eventTypeConfig).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }));

  const handleNaturalParse = async () => {
    if (!naturalText.trim()) return;
    setParsing(true);
    await new Promise(r => setTimeout(r, 800));
    // Mock NLP parsing
    const t = naturalText.toLowerCase();
    if (t.includes("ateş") || t.includes("derece")) { setType("fever"); setTitle("Ateş ölçümü"); const match = t.match(/(\d+[\.,]\d+|\d+)\s*derece/); setValue(match ? match[1].replace(",", ".") + "°C" : ""); }
    else if (t.includes("uyku") || t.includes("uyudu") || t.includes("uyandı")) { setType("sleep"); setTitle("Uyku kaydı"); }
    else if (t.includes("ilaç") || t.includes("verdi") || t.includes("şurup")) { setType("med"); setTitle("İlaç verildi"); }
    else if (t.includes("mama") || t.includes("yedi") || t.includes("emzir")) { setType("feed"); setTitle("Beslenme"); }
    else if (t.includes("bez") || t.includes("kaka") || t.includes("çiş")) { setType("diaper"); setTitle("Bez değişimi"); }
    else { setType("note"); setTitle("Günlük not"); }
    setNote(naturalText);
    setParsing(false);
    setMode("quick");
  };

  const handleSave = () => {
    const cfg = eventTypeConfig[type];
    onSave({ type, title: title || cfg.label, value, note, dateTime: new Date().toISOString() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Kayıt Ekle">
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["quick", "natural"].map(m => (
          <Btn key={m} variant={mode === m ? "primary" : "secondary"} small onClick={() => setMode(m)} style={{ flex: 1 }}>
            {m === "quick" ? "📋 Hızlı" : "💬 Doğal Dil"}
          </Btn>
        ))}
      </div>

      {mode === "natural" ? (
        <div>
          <Input label='Doğal dille anlat' value={naturalText} onChange={setNaturalText} multiline placeholder={'Örn: "38 derece ateşi var, 14.30\'da ölçtüm, biraz halsiz"\n"Sabah 7\'de uyandı, kahvaltıda yoğurt yedi"'} />
          <div style={{ background: T.sageXL, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: T.textM }}>
            💡 Uygulamanın kayıt türünü otomatik belirlemesi için doğal cümle yazın.
          </div>
          <Btn onClick={handleNaturalParse} disabled={parsing || !naturalText.trim()} style={{ width: "100%" }}>
            {parsing ? "Analiz ediliyor..." : "Kayda Dönüştür →"}
          </Btn>
        </div>
      ) : (
        <div>
          <Select label="Kayıt türü" value={type} onChange={setType} options={typeOptions} />
          <Input label="Başlık" value={title} onChange={setTitle} placeholder={eventTypeConfig[type]?.label || "Başlık"} />
          <Input label="Değer / Açıklama" value={value} onChange={setValue} placeholder={type === "fever" ? "38.5°C" : type === "sleep" ? "20:30 – 07:00" : "Detay"} />
          <Input label="Not (isteğe bağlı)" value={note} onChange={setNote} multiline placeholder="Ek not..." />
          {type === "med" && (
            <div style={{ background: T.peachXL, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: T.peach, border: `1px solid ${T.peachL}` }}>
              ⚠️ Bu alan doktorunuzun verdiği bilgileri kaydetmek içindir. Uygulama ilaç önermez, doz belirlemez.
            </div>
          )}
          <Btn onClick={handleSave} style={{ width: "100%" }}>Kaydet</Btn>
        </div>
      )}
    </Modal>
  );
}

// --- AI SCREEN ---
function AIScreen({ child, events, meds, vaccines }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Merhaba! Ben Nuna AI, ${child.name}'in kişisel asistanıyım.\n\n${child.name}'in kayıtlarına erişimim var — uyku, beslenme, ateş, ilaç, aşı ve gelişim verilerine göre size bağlamsal destek sunabilirim.\n\nNe sormak istersiniz?`,
      flags: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const quickPrompts = [
    "Son ateş kayıtlarını analiz et",
    "Uyku düzeni nasıl?",
    "Doktor randevusuna hazırlık özeti yap",
    "Bugünkü gelişim aktivitesi öner",
    "Aşı takvimine bak",
  ];

  const send = async (q) => {
    const question = q || input.trim();
    if (!question || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: question }]);
    setLoading(true);
    const res = await askAI(question, child, events);
    setLoading(false);
    setMessages(m => [...m, { role: "assistant", text: res.text, flags: res.flags }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 16px", background: `linear-gradient(135deg, ${T.lilaXL}, ${T.blueXL})`, borderBottom: `1px solid ${T.beigeD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 32 }}>✨</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Nuna AI Asistan</div>
            <div style={{ fontSize: 13, color: T.textM }}>{child.name}'in verisine dayalı karar desteği</div>
          </div>
        </div>
        <div style={{ background: T.peachXL, borderRadius: 10, padding: "8px 12px", marginTop: 12, fontSize: 12, color: T.peach, border: `1px solid ${T.peachL}` }}>
          ⚠️ Tıbbi teşhis koymaz · İlaç dozu vermez · Acil durumda 112'yi arayın
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "88%",
              background: m.role === "user" ? T.sage : m.flags?.includes("EMERGENCY") ? T.redXL : T.white,
              color: m.role === "user" ? T.white : T.text,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "12px 16px",
              boxShadow: `0 2px 8px ${T.shadow}`,
              fontSize: 14,
              lineHeight: 1.7,
              border: m.flags?.includes("EMERGENCY") ? `1.5px solid ${T.redL}` : "none",
              whiteSpace: "pre-wrap",
            }}>
              {m.flags?.includes("EMERGENCY") && <div style={{ fontWeight: 700, color: T.red, marginBottom: 8, fontSize: 15 }}>⚠️ ACİL DURUM</div>}
              {m.text.split("\n").map((line, j) => {
                if (line.startsWith("**") && line.endsWith("**")) return <div key={j} style={{ fontWeight: 700, color: m.role === "user" ? T.white : T.text, marginTop: j > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>;
                if (line.startsWith("→ ")) return <div key={j} style={{ paddingLeft: 12, borderLeft: `3px solid ${m.role === "user" ? "rgba(255,255,255,0.5)" : T.peachL}`, marginLeft: 4, marginTop: 4, color: m.role === "user" ? "rgba(255,255,255,0.9)" : T.textM }}>{line.slice(2)}</div>;
                if (line.startsWith("• ")) return <div key={j} style={{ paddingLeft: 10, marginTop: 2 }}>• {line.slice(2)}</div>;
                return <span key={j}>{line}{j < m.text.split("\n").length - 1 ? <br /> : ""}</span>;
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: "12px 16px", marginBottom: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.lila, animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length < 2 && (
        <div style={{ padding: "0 16px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
            {quickPrompts.map(p => (
              <button key={p} onClick={() => send(p)} style={{
                background: T.white, border: `1.5px solid ${T.beigeD}`, borderRadius: 20, padding: "8px 14px",
                fontSize: 12, color: T.text, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", fontWeight: 500,
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px", background: T.white, borderTop: `1px solid ${T.beige}`, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={`${child.name} hakkında soru sor...`}
          style={{
            flex: 1, border: `1.5px solid ${T.beigeD}`, borderRadius: 24, padding: "10px 16px",
            fontSize: 14, fontFamily: "inherit", background: T.cream, color: T.text, outline: "none",
          }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width: 44, height: 44, borderRadius: "50%", background: T.sage, border: "none",
          cursor: "pointer", fontSize: 18, color: T.white, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: !input.trim() || loading ? 0.5 : 1,
        }}>→</button>
      </div>
    </div>
  );
}

// --- HEALTH SCREEN ---
function HealthScreen({ child, events, meds, setMeds, vaccines, setVaccines }) {
  const [tab, setTab] = useState("fever");
  const [addMedModal, setAddMedModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", doctorName: "", dosageText: "", frequencyText: "", startDate: "", notes: "" });
  const [feverVal, setFeverVal] = useState("");
  const [feverNote, setFeverNote] = useState("");
  const [feverAdded, setFeverAdded] = useState(false);

  const feverEvents = events.filter(e => e.type === "fever");

  const tabs = [
    { id: "fever", icon: "🌡️", label: "Ateş" },
    { id: "med", icon: "💊", label: "İlaçlar" },
    { id: "vaccine", icon: "💉", label: "Aşılar" },
    { id: "doctor", icon: "👨‍⚕️", label: "Doktor" },
  ];

  const redFlags = [
    "3 aydan küçük bebekte ateş",
    "Nefes darlığı",
    "Morarma",
    "Bilinç bulanıklığı",
    "Havale",
    "Ense sertliği",
    "Sürekli kusma",
    "Döküntü + ateş",
  ];

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ padding: "48px 20px 0", background: T.white, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 14 }}>Sağlık Takibi</div>
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.beigeD}`, paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none", padding: "10px 14px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              color: tab === t.id ? T.sage : T.textM,
              borderBottom: tab === t.id ? `2.5px solid ${T.sage}` : "2.5px solid transparent",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* FEVER TAB */}
        {tab === "fever" && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 14 }}>Ateş Ölçümü Ekle</div>
              <Input label="Derece (°C)" value={feverVal} onChange={setFeverVal} placeholder="38.5" type="number" />
              <Input label="Not" value={feverNote} onChange={setFeverNote} placeholder="Belirti, verilen ilaç..." multiline />
              {feverAdded && <div style={{ color: T.sage, fontSize: 13, marginBottom: 10 }}>✓ Kaydedildi!</div>}
              <Btn onClick={() => { if (feverVal) { setFeverAdded(true); setTimeout(() => setFeverAdded(false), 2000); setFeverVal(""); setFeverNote(""); } }} style={{ width: "100%" }}>Kaydet</Btn>
              {parseFloat(feverVal) >= 39 && (
                <div style={{ marginTop: 12, background: T.redXL, borderRadius: 10, padding: 12, fontSize: 13, color: T.red, border: `1px solid ${T.redL}`, fontWeight: 600 }}>
                  ⚠️ Ateş 39°C ve üzeri. Lütfen doktorunuzla iletişime geçin veya 112'yi arayın.
                </div>
              )}
            </Card>

            {/* Fever history */}
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Ateş Geçmişi</div>
            {feverEvents.length === 0 && <div style={{ color: T.textL, fontSize: 14, marginBottom: 16 }}>Ateş kaydı yok</div>}
            {feverEvents.map(e => (
              <Card key={e.id} style={{ marginBottom: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{e.value}</div>
                  <div style={{ color: T.textL, fontSize: 12 }}>{formatTime(e.dateTime)}</div>
                </div>
                {e.note && <div style={{ color: T.textM, fontSize: 13, marginTop: 4 }}>{e.note}</div>}
              </Card>
            ))}

            {/* Red Flags */}
            <Card style={{ background: T.redXL, border: `1px solid ${T.redL}` }}>
              <div style={{ fontWeight: 700, color: T.red, marginBottom: 10 }}>🚨 Acil Belirtiler — Hemen 112 veya Doktor</div>
              {redFlags.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.redL}`, fontSize: 13, color: T.text }}>
                  <span style={{ color: T.red }}>•</span> {f}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* MED TAB */}
        {tab === "med" && (
          <div>
            <div style={{ background: T.peachXL, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: T.peach, border: `1px solid ${T.peachL}` }}>
              ⚠️ Bu alan doktorunuzun verdiği bilgileri kaydetmek içindir. Uygulama ilaç önermez, doz belirlemez.
            </div>
            <Btn onClick={() => setAddMedModal(true)} style={{ width: "100%", marginBottom: 16 }}>+ İlaç Ekle</Btn>
            {meds.map(m => (
              <Card key={m.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: T.text }}>{m.name}</div>
                  <Tag color={T.sage} bg={T.sageXL}>Aktif</Tag>
                </div>
                <div style={{ fontSize: 13, color: T.textM }}>Dr: {m.doctorName}</div>
                <div style={{ fontSize: 13, color: T.textM }}>Doz: {m.dosageText} · {m.frequencyText}</div>
                {m.notes && <div style={{ fontSize: 12, color: T.textL, marginTop: 6, fontStyle: "italic" }}>{m.notes}</div>}
              </Card>
            ))}

            <Modal open={addMedModal} onClose={() => setAddMedModal(false)} title="İlaç Ekle">
              <div style={{ background: T.peachXL, borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: T.peach }}>
                ⚠️ Lütfen yalnızca doktorunuzun belirttiği bilgileri girin.
              </div>
              <Input label="İlaç adı" value={newMed.name} onChange={v => setNewMed(p => ({...p, name: v}))} placeholder="İlaç adı" required />
              <Input label="Doktor adı" value={newMed.doctorName} onChange={v => setNewMed(p => ({...p, doctorName: v}))} placeholder="Dr. Ad Soyad" />
              <Input label="Doz (doktora göre)" value={newMed.dosageText} onChange={v => setNewMed(p => ({...p, dosageText: v}))} placeholder="Örn: 5ml" />
              <Input label="Kullanım sıklığı" value={newMed.frequencyText} onChange={v => setNewMed(p => ({...p, frequencyText: v}))} placeholder="Örn: Günde 2" />
              <Input label="Başlangıç tarihi" value={newMed.startDate} onChange={v => setNewMed(p => ({...p, startDate: v}))} type="date" />
              <Input label="Not" value={newMed.notes} onChange={v => setNewMed(p => ({...p, notes: v}))} placeholder="Ek not..." multiline />
              <Btn onClick={() => { if (newMed.name) { setMeds(prev => [...prev, { ...newMed, id: "m" + Date.now() }]); setAddMedModal(false); setNewMed({ name: "", doctorName: "", dosageText: "", frequencyText: "", startDate: "", notes: "" }); } }} style={{ width: "100%" }}>Kaydet</Btn>
            </Modal>
          </div>
        )}

        {/* VACCINE TAB */}
        {tab === "vaccine" && (
          <div>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Aşı Takvimi</div>
            {vaccines.map(v => (
              <Card key={v.id} style={{ marginBottom: 10, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: T.text }}>{v.vaccineName}</div>
                    <div style={{ fontSize: 12, color: T.textM, marginTop: 4 }}>
                      {v.completedDate ? `✓ Yapıldı: ${v.completedDate}` : `📅 Planlandı: ${v.plannedDate}`}
                    </div>
                    {v.sideEffects && <div style={{ fontSize: 12, color: T.textL, marginTop: 2 }}>Yan etki: {v.sideEffects}</div>}
                  </div>
                  <Tag color={v.completedDate ? T.sage : T.peach} bg={v.completedDate ? T.sageXL : T.peachXL}>
                    {v.completedDate ? "✓ Tamamlandı" : "Bekliyor"}
                  </Tag>
                </div>
              </Card>
            ))}

            {vaccines.some(v => !v.completedDate) && (
              <Card style={{ background: T.blueXL, border: `1px solid ${T.blueL}`, marginTop: 16 }}>
                <div style={{ fontWeight: 700, color: T.blue, marginBottom: 8 }}>💉 Bekleyen Aşılar</div>
                {vaccines.filter(v => !v.completedDate).map(v => (
                  <div key={v.id} style={{ fontSize: 13, color: T.text, padding: "4px 0" }}>• {v.vaccineName} — {v.plannedDate}</div>
                ))}
                <div style={{ marginTop: 10, fontSize: 13, color: T.textM }}>Doktor randevunuzda bu aşıları sormayı unutmayın.</div>
              </Card>
            )}
          </div>
        )}

        {/* DOCTOR TAB */}
        {tab === "doctor" && (
          <div>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>Doktor Ziyaretleri</div>
            {initDoctorVisits.map(v => (
              <Card key={v.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: T.text }}>{v.doctorName}</div>
                  <div style={{ fontSize: 12, color: T.textL }}>{v.visitDate}</div>
                </div>
                <div style={{ fontSize: 13, color: T.textM }}><strong>Şikayet:</strong> {v.complaint}</div>
                <div style={{ fontSize: 13, color: T.textM, marginTop: 4 }}><strong>Teşhis:</strong> {v.diagnosisText}</div>
                <div style={{ fontSize: 13, color: T.textM, marginTop: 4 }}><strong>Öneri:</strong> {v.recommendation}</div>
              </Card>
            ))}

            {/* Doctor appointment prep */}
            <Card style={{ background: T.sageXL, border: `1px solid ${T.sageL}` }}>
              <div style={{ fontWeight: 700, color: T.sage, marginBottom: 10 }}>📋 Doktor Randevusu Özeti</div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>
                <div><strong>Hasta:</strong> {child.name} · {getAge(child.birthDate)} · {child.weight} kg</div>
                <div><strong>Kan grubu:</strong> {child.bloodType}</div>
                <div><strong>Alerjiler:</strong> {child.allergies.join(", ") || "Yok"}</div>
                <div><strong>Kronik hastalık:</strong> {child.chronicConditions.join(", ") || "Yok"}</div>
                <div style={{ marginTop: 8 }}><strong>Son belirtiler:</strong> Kayıtlara göre son ziyarette üst solunum yolu enfeksiyonu</div>
                <div style={{ marginTop: 8 }}><strong>Güncel ilaçlar:</strong> {meds.map(m => m.name).join(", ")}</div>
                <div style={{ marginTop: 8 }}><strong>Bekleyen aşı:</strong> KKK</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PROFILE SCREEN ---
function ProfileScreen({ child, events }) {
  const [tab, setTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profil" },
    { id: "growth", label: "Büyüme" },
    { id: "milestones", label: "Gelişim" },
    { id: "emergency", label: "🚨 Acil" },
  ];

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ padding: "48px 20px 0", background: T.white, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 14 }}>{child.name}'in Profili</div>
        <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.beigeD}` }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              color: tab === t.id ? T.sage : T.textM,
              borderBottom: tab === t.id ? `2.5px solid ${T.sage}` : "2.5px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {tab === "profile" && (
          <div>
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: T.sageXL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, margin: "0 auto 12px" }}>
                {child.gender === "kız" ? "👧" : "👦"}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>{child.name}</div>
              <div style={{ color: T.textM, marginTop: 4 }}>{getAge(child.birthDate)}</div>
            </div>

            {/* Info cards */}
            {[
              { label: "Doğum Tarihi", value: new Date(child.birthDate).toLocaleDateString("tr-TR") },
              { label: "Cinsiyet", value: child.gender === "kız" ? "Kız" : "Erkek" },
              { label: "Kan Grubu", value: child.bloodType },
              { label: "Ağırlık", value: `${child.weight} kg` },
              { label: "Boy", value: `${child.height} cm` },
              { label: "Alerjiler", value: child.allergies.join(", ") || "Yok" },
              { label: "Kronik Hastalık", value: child.chronicConditions.join(", ") || "Yok" },
              { label: "Doktor", value: child.doctorInfo.name },
              { label: "Doktor Tel", value: child.doctorInfo.phone },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.beige}` }}>
                <span style={{ color: T.textM, fontSize: 14 }}>{item.label}</span>
                <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "growth" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Ağırlık", value: `${child.weight} kg`, icon: "⚖️", color: T.blue },
                { label: "Boy", value: `${child.height} cm`, icon: "📏", color: T.sage },
              ].map(m => (
                <Card key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{m.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.color, marginTop: 8 }}>{m.value}</div>
                  <div style={{ fontSize: 13, color: T.textM }}>{m.label}</div>
                </Card>
              ))}
            </div>

            {/* Simple growth chart visual */}
            <Card>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 12 }}>📈 Boy Takibi</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
                {[60, 65, 68, 71, 74, 76, 79].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", height: `${(h / 79) * 70}px`, background: i === 6 ? T.sage : T.sageL, borderRadius: "4px 4px 0 0", minHeight: 8 }} />
                    </div>
                    <div style={{ fontSize: 9, color: T.textL, marginTop: 4 }}>{h}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: T.textL, marginTop: 8, textAlign: "center" }}>Son 7 ölçüm (cm)</div>
            </Card>
          </div>
        )}

        {tab === "milestones" && (
          <div>
            <div style={{ background: T.sageXL, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 13, color: T.textM }}>
              ✨ Her çocuğun gelişimi farklıdır. Bu kilometre taşları genel rehber niteliğindedir.
            </div>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${T.beige}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.done ? T.sage : T.beigeD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  {m.done ? "✓" : "○"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: m.done ? T.text : T.textM }}>{m.label}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <Tag color={T.textM} bg={T.beige}>{m.age}</Tag>
                    <Tag color={T.lila} bg={T.lilaXL}>{m.category}</Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "emergency" && (
          <div>
            <Card style={{ background: T.redXL, border: `2px solid ${T.red}`, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.red, marginBottom: 14, textAlign: "center" }}>🚨 ACİL DURUM BİLGİLERİ</div>
              {[
                { label: "Ad", value: child.name },
                { label: "Yaş", value: getAge(child.birthDate) },
                { label: "Ağırlık", value: `${child.weight} kg` },
                { label: "Kan Grubu", value: child.bloodType },
                { label: "Alerjiler", value: child.allergies.join(", ") },
                { label: "Doktor", value: child.doctorInfo.name },
                { label: "Doktor Tel", value: child.doctorInfo.phone },
                { label: "Acil Kişi", value: child.emergencyContact.name },
                { label: "Acil Tel", value: child.emergencyContact.phone },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.redL}` }}>
                  <span style={{ color: T.red, fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: 13 }}>{item.value}</span>
                </div>
              ))}
            </Card>

            <a href="tel:112" style={{ display: "block", textDecoration: "none" }}>
              <button style={{ width: "100%", background: T.red, color: T.white, border: "none", borderRadius: 14, padding: 18, fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
                📞 112'yi Ara
              </button>
            </a>

            <Btn variant="secondary" style={{ width: "100%", fontSize: 14 }}>🏥 Yakındaki Hastane Bul</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function NunaApp() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [child, setChild] = useState(initChild);
  const [events, setEvents] = useState(initEvents);
  const [meds, setMeds] = useState(initMeds);
  const [vaccines, setVaccines] = useState(initVaccines);
  const [addEventModal, setAddEventModal] = useState(false);
  const [addEventType, setAddEventType] = useState("note");

  const handleComplete = (data) => {
    setChild(prev => ({ ...prev, name: data.childName, birthDate: data.birthDate, gender: data.gender }));
    setOnboarded(true);
  };

  const handleQuickAdd = (type) => {
    setAddEventType(type);
    setAddEventModal(true);
  };

  const handleSaveEvent = (ev) => {
    setEvents(prev => [{ ...ev, id: "e" + Date.now() }, ...prev]);
  };

  if (!onboarded) {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${T.cream}; }
        `}</style>
        <OnboardingScreen onComplete={handleComplete} />
      </>
    );
  }

  const screens = {
    home: <HomeScreen child={child} events={events} onQuickAdd={handleQuickAdd} onNav={setActiveTab} />,
    timeline: <TimelineScreen events={events} onAdd={() => { setAddEventType("note"); setAddEventModal(true); }} />,
    ai: <AIScreen child={child} events={events} meds={meds} vaccines={vaccines} />,
    health: <HealthScreen child={child} events={events} meds={meds} setMeds={setMeds} vaccines={vaccines} setVaccines={setVaccines} />,
    profile: <ProfileScreen child={child} events={events} />,
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${T.cream}; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.cream, position: "relative" }}>
        {/* Screen content */}
        <div style={{ minHeight: "100vh" }}>
          {screens[activeTab]}
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: T.white, borderTop: `1px solid ${T.beigeD}`, padding: "8px 0 12px", zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {navItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: "6px 12px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "inherit",
                }}>
                  <div style={{ fontSize: 22, opacity: active ? 1 : 0.45 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? T.sage : T.textL }}>{item.label}</div>
                  {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.sage }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Event Modal */}
        <AddEventModal
          open={addEventModal}
          onClose={() => setAddEventModal(false)}
          onSave={handleSaveEvent}
          defaultType={addEventType}
        />
      </div>
    </>
  );
}
