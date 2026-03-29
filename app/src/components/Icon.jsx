import {
  Target, HourglassSimple, User, Wallet, CreditCard, TrendUp,
  SlidersHorizontal, Umbrella, Scissors, Lightbulb,
  Tag, House, Trophy, FileText, BookOpen, Lock,
  Coins, Bank, Building, Scales, ChartLineUp, Rocket,
  Sliders, GraduationCap
} from '@phosphor-icons/react';

const ICON_MAP = {
  target: Target,
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
  lock: Lock,
  coins: Coins,
  bank: Bank,
  landmark: Building,
  scales: Scales,
  'chart-line-up': ChartLineUp,
  rocket: Rocket,
  'graduation-cap': GraduationCap,
  'sliders-h': Sliders,
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
