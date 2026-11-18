import { startAutoTranslate } from '@/lib/auto-translate'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type LangCode = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr' | 'bn' | 'gu' | 'pa' | 'or' | 'as' | 'ur'

export const LANGUAGES: { code: LangCode; english: string; native: string; font?: string; rtl?: boolean }[] = [
  { code: 'en', english: 'English', native: 'English' },
  { code: 'hi', english: 'Hindi', native: 'हिन्दी', font: 'Noto Sans Devanagari' },
  { code: 'kn', english: 'Kannada', native: 'ಕನ್ನಡ', font: 'Noto Sans Kannada' },
  { code: 'ta', english: 'Tamil', native: 'தமிழ்', font: 'Noto Sans Tamil' },
  { code: 'te', english: 'Telugu', native: 'తెలుగు', font: 'Noto Sans Telugu' },
  { code: 'ml', english: 'Malayalam', native: 'മലയാളം', font: 'Noto Sans Malayalam' },
  { code: 'mr', english: 'Marathi', native: 'मराठी', font: 'Noto Sans Devanagari' },
  { code: 'bn', english: 'Bengali', native: 'বাংলা', font: 'Noto Sans Bengali' },
  { code: 'gu', english: 'Gujarati', native: 'ગુજરાતી', font: 'Noto Sans Gujarati' },
  { code: 'pa', english: 'Punjabi', native: 'ਪੰਜਾਬੀ', font: 'Noto Sans Gurmukhi' },
  { code: 'or', english: 'Odia', native: 'ଓଡ଼ିଆ', font: 'Noto Sans Oriya' },
  { code: 'as', english: 'Assamese', native: 'অসমীয়া', font: 'Noto Sans Bengali' },
  { code: 'ur', english: 'Urdu', native: 'اردو', font: 'Noto Nastaliq Urdu', rtl: true },
]

// Key order shared by every dictionary row below.
const KEYS = [
  'nav.home', 'nav.tests', 'nav.evidence', 'nav.sync', 'nav.profile', 'nav.command', 'nav.security', 'nav.alerts',
  'nav.oversight', 'nav.startTest', 'status.online', 'status.offline', 'login.officerId', 'login.password',
  'login.secureLogin', 'login.deviceAuth',
  'f6.title',
  'f6.generated',
  'f6.draft',
  'f6.confirmed',
  'f6.pending',
  'f6.auto',
  'f6.edit',
  'f6.saveChanges',
  'f6.confirm',
  'f6.pdf',
  'f6.print',
  'f6.revise',
  'f6.generate',
  'f6.history',
  'f6.caseId',
  'f6.evidenceId',
  'f6.officer',
  'f6.dateTime',
  'f6.place',
  'f6.sample',
  'f6.kit',
  'f6.reaction',
  'f6.result',
  'f6.ai',
  'f6.hash',
  'f6.quantity',
  'f6.witness',
  'f6.observations',
  'f6.remarks',
  'f6.note',
  'f6.sig',
  'f6.revision',
] as const
export type TKey = (typeof KEYS)[number]

const ROWS: Record<LangCode, string[]> = {
  en: ['Home', 'Tests', 'Evidence', 'Sync', 'Profile', 'Command Center', 'Security', 'Alerts', 'Oversight', 'Start new test', 'Online', 'Offline', 'Officer ID', 'Password', 'Secure login', 'Use device authentication',
    'Form 6 – Automatic Form Generation',
    'FORM 6 GENERATED',
    'DRAFT – not certified until confirmed by an authorised officer',
    'CONFIRMED',
    'Pending Input',
    'AUTO',
    'Edit details',
    'Save changes',
    'Confirm and save',
    'Download PDF',
    'Print',
    'Create revised version',
    'Generate Form 6',
    'Audit history',
    'Case ID',
    'Evidence ID',
    'Officer',
    'Date/time of test',
    'Place',
    'Sample description',
    'Test kit',
    'Observed reaction colour',
    'Preliminary result',
    'AI assist',
    'Photo SHA-256',
    'Quantity of sample',
    'Witness',
    'Observations',
    'Remarks',
    'Presumptive field test only. Confirmatory analysis by an FSL is required.',
    'Officer signature',
    'Revision'],
  hi: ['होम', 'परीक्षण', 'साक्ष्य', 'सिंक', 'प्रोफ़ाइल', 'कमांड सेंटर', 'सुरक्षा', 'अलर्ट', 'निगरानी', 'नया परीक्षण शुरू करें', 'ऑनलाइन', 'ऑफ़लाइन', 'अधिकारी आईडी', 'पासवर्ड', 'सुरक्षित लॉगिन', 'डिवाइस प्रमाणीकरण का उपयोग करें'],
  kn: ['ಮುಖಪುಟ', 'ಪರೀಕ್ಷೆಗಳು', 'ಸಾಕ್ಷ್ಯ', 'ಸಿಂಕ್', 'ಪ್ರೊಫೈಲ್', 'ಕಮಾಂಡ್ ಸೆಂಟರ್', 'ಭದ್ರತೆ', 'ಎಚ್ಚರಿಕೆಗಳು', 'ಮೇಲ್ವಿಚಾರಣೆ', 'ಹೊಸ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ', 'ಆನ್‌ಲೈನ್', 'ಆಫ್‌ಲೈನ್', 'ಅಧಿಕಾರಿ ಐಡಿ', 'ಪಾಸ್‌ವರ್ಡ್', 'ಸುರಕ್ಷಿತ ಲಾಗಿನ್', 'ಸಾಧನ ದೃಢೀಕರಣ ಬಳಸಿ'],
  ta: ['முகப்பு', 'சோதனைகள்', 'சான்றுகள்', 'ஒத்திசைவு', 'சுயவிவரம்', 'கட்டளை மையம்', 'பாதுகாப்பு', 'எச்சரிக்கைகள்', 'கண்காணிப்பு', 'புதிய சோதனையைத் தொடங்கு', 'ஆன்லைன்', 'ஆஃப்லைன்', 'அதிகாரி ஐடி', 'கடவுச்சொல்', 'பாதுகாப்பான உள்நுழைவு', 'சாதன அங்கீகாரத்தைப் பயன்படுத்து'],
  te: ['హోమ్', 'పరీక్షలు', 'సాక్ష్యం', 'సింక్', 'ప్రొఫైల్', 'కమాండ్ సెంటర్', 'భద్రత', 'హెచ్చరికలు', 'పర్యవేక్షణ', 'కొత్త పరీక్ష ప్రారంభించండి', 'ఆన్‌లైన్', 'ఆఫ్‌లైన్', 'అధికారి ఐడి', 'పాస్‌వర్డ్', 'సురక్షిత లాగిన్', 'పరికర ధృవీకరణ ఉపయోగించండి'],
  ml: ['ഹോം', 'പരിശോധനകൾ', 'തെളിവ്', 'സിങ്ക്', 'പ്രൊഫൈൽ', 'കമാൻഡ് സെന്റർ', 'സുരക്ഷ', 'അലേർട്ടുകൾ', 'മേൽനോട്ടം', 'പുതിയ പരിശോധന ആരംഭിക്കുക', 'ഓൺലൈൻ', 'ഓഫ്‌ലൈൻ', 'ഉദ്യോഗസ്ഥ ഐഡി', 'പാസ്‌വേഡ്', 'സുരക്ഷിത ലോഗിൻ', 'ഉപകരണ പ്രാമാണീകരണം ഉപയോഗിക്കുക'],
  mr: ['मुख्यपृष्ठ', 'चाचण्या', 'पुरावा', 'सिंक', 'प्रोफाइल', 'कमांड सेंटर', 'सुरक्षा', 'अलर्ट', 'देखरेख', 'नवीन चाचणी सुरू करा', 'ऑनलाइन', 'ऑफलाइन', 'अधिकारी आयडी', 'पासवर्ड', 'सुरक्षित लॉगिन', 'डिव्हाइस प्रमाणीकरण वापरा'],
  bn: ['হোম', 'পরীক্ষা', 'প্রমাণ', 'সিঙ্ক', 'প্রোফাইল', 'কমান্ড সেন্টার', 'নিরাপত্তা', 'সতর্কতা', 'তদারকি', 'নতুন পরীক্ষা শুরু করুন', 'অনলাইন', 'অফলাইন', 'কর্মকর্তা আইডি', 'পাসওয়ার্ড', 'নিরাপদ লগইন', 'ডিভাইস প্রমাণীকরণ ব্যবহার করুন'],
  gu: ['હોમ', 'પરીક્ષણો', 'પુરાવા', 'સિંક', 'પ્રોફાઇલ', 'કમાન્ડ સેન્ટર', 'સુરક્ષા', 'ચેતવણીઓ', 'દેખરેખ', 'નવું પરીક્ષણ શરૂ કરો', 'ઓનલાઇન', 'ઓફલાઇન', 'અધિકારી આઈડી', 'પાસવર્ડ', 'સુરક્ષિત લૉગિન', 'ઉપકરણ પ્રમાણીકરણનો ઉપયોગ કરો'],
  pa: ['ਮੁੱਖ ਪੰਨਾ', 'ਟੈਸਟ', 'ਸਬੂਤ', 'ਸਿੰਕ', 'ਪ੍ਰੋਫਾਈਲ', 'ਕਮਾਂਡ ਸੈਂਟਰ', 'ਸੁਰੱਖਿਆ', 'ਚੇਤਾਵਨੀਆਂ', 'ਨਿਗਰਾਨੀ', 'ਨਵਾਂ ਟੈਸਟ ਸ਼ੁਰੂ ਕਰੋ', 'ਔਨਲਾਈਨ', 'ਔਫਲਾਈਨ', 'ਅਧਿਕਾਰੀ ਆਈਡੀ', 'ਪਾਸਵਰਡ', 'ਸੁਰੱਖਿਅਤ ਲੌਗਇਨ', 'ਡਿਵਾਈਸ ਪ੍ਰਮਾਣੀਕਰਨ ਵਰਤੋ'],
  or: ['ହୋମ୍', 'ପରୀକ୍ଷା', 'ପ୍ରମାଣ', 'ସିଙ୍କ', 'ପ୍ରୋଫାଇଲ୍', 'କମାଣ୍ଡ ସେଣ୍ଟର', 'ସୁରକ୍ଷା', 'ସତର୍କତା', 'ତଦାରଖ', 'ନୂଆ ପରୀକ୍ଷା ଆରମ୍ଭ କରନ୍ତୁ', 'ଅନଲାଇନ୍', 'ଅଫଲାଇନ୍', 'ଅଧିକାରୀ ଆଇଡି', 'ପାସୱାର୍ଡ', 'ସୁରକ୍ଷିତ ଲଗଇନ୍', 'ଡିଭାଇସ୍ ପ୍ରମାଣୀକରଣ ବ୍ୟବହାର କରନ୍ତୁ'],
  as: ['হোম', 'পৰীক্ষা', 'প্ৰমাণ', 'ছিংক', 'প্ৰফাইল', 'কমাণ্ড চেণ্টাৰ', 'সুৰক্ষা', 'সতৰ্কবাণী', 'তত্ত্বাৱধান', 'নতুন পৰীক্ষা আৰম্ভ কৰক', 'অনলাইন', 'অফলাইন', 'বিষয়াৰ আইডি', 'পাছৱৰ্ড', 'সুৰক্ষিত লগইন', 'ডিভাইচ প্ৰমাণীকৰণ ব্যৱহাৰ কৰক'],
  ur: ['ہوم', 'ٹیسٹ', 'ثبوت', 'سنک', 'پروفائل', 'کمانڈ سینٹر', 'سیکیورٹی', 'الرٹس', 'نگرانی', 'نیا ٹیسٹ شروع کریں', 'آن لائن', 'آف لائن', 'افسر آئی ڈی', 'پاس ورڈ', 'محفوظ لاگ اِن', 'ڈیوائس تصدیق استعمال کریں'],
}

export const dictionaries = Object.fromEntries(
  (Object.keys(ROWS) as LangCode[]).map((c) => [c, Object.fromEntries(KEYS.map((k, i) => [k, ROWS[c][i]]))]),
) as Record<LangCode, Record<TKey, string>>

const LANG_KEY = 'narcotrace.lang'

function loadLang(): LangCode {
  try {
    const v = localStorage.getItem(LANG_KEY) as LangCode | null
    if (v && LANGUAGES.some((l) => l.code === v)) return v
  } catch { /* storage unavailable */ }
  return 'en'
}

type Ctx = { lang: LangCode; setLang: (l: LangCode) => void; t: (key: TKey) => string }
const I18nContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(loadLang)
  const [trStatus, setTrStatus] = useState<'idle' | 'busy' | 'unavailable'>('idle')

  const setLang = (l: LangCode) => {
    setLangState(l)
    try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ }
  }

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang)!
    const root = document.documentElement
    root.lang = lang
    root.dir = meta.rtl ? 'rtl' : 'ltr'
    if (meta.font) {
      const id = `font-${meta.font.replace(/\s+/g, '-')}`
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${meta.font.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`
        document.head.appendChild(link)
      }
      root.style.setProperty('--font-sans', `'${meta.font}', 'Inter', system-ui, sans-serif`)
    } else {
      root.style.removeProperty('--font-sans')
    }
  }, [lang])

  useEffect(() => {
    const t = window.setTimeout(() => {}, 0)
    const stop = startAutoTranslate(lang, setTrStatus)
    return () => { clearTimeout(t); stop() }
  }, [lang])

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key }),
    [lang],
  )
  return (
    <I18nContext.Provider value={value}>
      {children}
      {lang !== 'en' && trStatus !== 'idle' && (
        <div data-notranslate className="fixed bottom-4 start-1/2 z-50 -translate-x-1/2 rounded-md border border-line-700 bg-ink-900 px-3 py-1.5 text-xs text-mist-300 shadow-lg">
          {trStatus === 'busy' ? 'Translating… / अनुवाद…' : 'Live translation unavailable here — showing English'}
        </div>
      )}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider')
  return ctx
}
