import {
  Target, HourglassSimple, User, Wallet, CreditCard, TrendUp,
  SlidersHorizontal, Umbrella, Scissors, Lightbulb,
  Tag, House, Trophy, FileText, BookOpen, Lock,
  Coins, Bank, Building, Scales, ChartLineUp, Rocket,
  Sliders, GraduationCap,
  // New icons for emoji replacement
  Crosshair, BookOpenText, CurrencyDollar, Warning, PencilSimple,
  Gift, Ruler, Buildings, Fire, PushPin, CheckCircle, Star,
  ClipboardText, Printer, CalendarBlank, HouseLine, Shield, Siren,
  Lightning, ChartBar, MagicWand, Money, ChatTeardropDots,
  Gear, Trash, Confetti, Car, Infinity, LockOpen, Globe,
  CaretDown, ArrowRight
} from '@phosphor-icons/react';

const ICON_MAP = {
  target: Target,
  crosshair: Crosshair,
  hourglass: HourglassSimple,
  user: User,
  wallet: Wallet,
  'credit-card': CreditCard,
  'trend-up': TrendUp,
  sliders: SlidersHorizontal,
  umbrella: Umbrella,
  scissors: Scissors,
  lightbulb: Lightbulb,
  tag: Tag,
  house: House,
  trophy: Trophy,
  'file-text': FileText,
  'book-open': BookOpen,
  'book-open-text': BookOpenText,
  lock: Lock,
  'lock-open': LockOpen,
  coins: Coins,
  bank: Bank,
  landmark: Building,
  buildings: Buildings,
  scales: Scales,
  'chart-line-up': ChartLineUp,
  'chart-bar': ChartBar,
  rocket: Rocket,
  'graduation-cap': GraduationCap,
  'sliders-h': Sliders,
  // New mappings
  'currency-dollar': CurrencyDollar,
  warning: Warning,
  pencil: PencilSimple,
  gift: Gift,
  ruler: Ruler,
  fire: Fire,
  'push-pin': PushPin,
  'check-circle': CheckCircle,
  star: Star,
  clipboard: ClipboardText,
  printer: Printer,
  calendar: CalendarBlank,
  'house-line': HouseLine,
  shield: Shield,
  siren: Siren,
  lightning: Lightning,
  'magic-wand': MagicWand,
  money: Money,
  chat: ChatTeardropDots,
  gear: Gear,
  trash: Trash,
  confetti: Confetti,
  car: Car,
  infinity: Infinity,
  globe: Globe,
  'caret-down': CaretDown,
  'arrow-right': ArrowRight,
};

/**
 * Renders a Phosphor icon by name string.
 * @param {string} name - Icon name from ICON_MAP
 * @param {number} [size=18] - Icon size in px
 * @param {string} [weight="light"] - Phosphor weight: thin|light|regular|bold|fill|duotone
 */
export default function Icon({ name, size = 18, weight = "light", color, style, className }) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component size={size} weight={weight} color={color} style={style} className={className} />;
}
