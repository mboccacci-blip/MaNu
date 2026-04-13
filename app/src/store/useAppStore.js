/**
 * MaNu PRO — Zustand Store
 * 
 * Central state management replacing ~50 useState calls.
 * Persists user financial data to localStorage automatically.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_EXP = [
  { id: 1, name: "Rent / Mortgage", amount: "", discretionary: false },
  { id: 2, name: "Groceries", amount: "", discretionary: false },
  { id: 3, name: "Transport", amount: "", discretionary: false },
  { id: 4, name: "Subscriptions", amount: "", discretionary: true },
  { id: 5, name: "Dining out", amount: "", discretionary: true },
];

const INITIAL_STATE = {
  // ── Navigation & UI ──
  tab: "achieve",
  setupDone: false,
  tier: "free",
  demoBannerVisible: false,
  showLeadModal: false,
  userEmail: "",
  emailError: "",
  magicRevealed: false,
  loaded: true,

  // ── Income & Basic ──
  age: "",
  monthlyIncome: "",
  expenses: DEFAULT_EXP,
  _nEId: 6,
  ownsHome: false,
  vacationAnnual: "",
  coupleMode: false,
  partner2Income: "",
  hasRental: false,
  rentalEquity: "",
  rentalNetIncome: "",

  // ── Debts ──
  debts: [{ id: 1, name: "", balance: "", rate: "", minPayment: "" }],
  noDebts: false,
  noMortgage: false,
  mortgageBalance: "",
  mortgageRate: "",
  mortgagePayment: "",
  mortgageYearsLeft: "",
  noCarLoan: false,
  carBalance: "",
  carRate: "",
  carPayment: "",
  carYearsLeft: "",
  _nDId: 2,

  // ── Retirement ──
  retirementAge: "",
  yearsPostRet: "",
  desiredIncome: "",
  existingSavings: "",
  socialSecurity: "",
  retProfileIdx: 4,
  chartProfileIdx: 4,
  chartRetireIdx: 3,
  legacy: "",
  assetTax: 0,
  manualMonthlySav: "",

  // ── Investment ──
  showNom: false,
  projYears: 10,
  customInflation: 2.5,
  showScenarios: true,
  customReturn: "",
  scenProfileIdx: 5,
  costNSProfileIdx: 4,

  // ── Portfolio ──
  portAlloc: [1, 1, 1, 1, 1, 1, 1],
  portContribAlloc: [1, 1, 1, 1, 1, 1, 1],

  // ── Strategy & Simulation ──
  savSliders: {},
  extraIncome: "",
  eiTemporary: false,
  eiYears: "5",
  costItemName: "",
  costItemPrice: "",
  costProfileIdx: 4,
  goals: [{ id: 1, name: "", amount: "", years: "", profileIdx: 4 }],
  _nGId: 2,
  showRec: true,
  simSav: null,
  simMo: null,
  simRet: null,

  // ── Reverse Calculator ──
  revDes: "",
  revYrs: "",
  revSS: "",
  revSav: "",
  revMo: "",
  revRet: 4.0,
  revRetProf: 4,

  // ── Cost of Inaction ──
  ciH: 20,
  ciDelayProf: 5,
  ciBase: 0,
  ciSav: null,
  ciMo: null,
};

// Fields that get persisted to localStorage
const PERSISTED_FIELDS = [
  'age', 'monthlyIncome', 'expenses', 'ownsHome', 'vacationAnnual',
  'coupleMode', 'partner2Income', 'hasRental', 'rentalEquity', 'rentalNetIncome',
  'debts', 'noDebts', 'noMortgage', 'mortgageBalance', 'mortgageRate', 'mortgagePayment', 'mortgageYearsLeft',
  'noCarLoan', 'carBalance', 'carRate', 'carPayment', 'carYearsLeft',
  'retirementAge', 'yearsPostRet', 'desiredIncome', 'existingSavings', 'socialSecurity',
  'legacy', 'assetTax', 'manualMonthlySav',
  'customInflation', 'customReturn', 'portAlloc', 'portContribAlloc',
  'extraIncome', 'eiTemporary', 'eiYears', 'goals',
  'tier', 'userEmail',
  '_nEId', '_nDId', '_nGId',
];

const useAppStore = create(
  persist(
    function (set, get) {
      return Object.assign({}, INITIAL_STATE, {
        // ── Generic setter ──
        setField: function (field, value) {
          set(function (s) {
            var u = {};
            u[field] = typeof value === 'function' ? value(s[field]) : value;
            return u;
          });
        },

        // ── Tab navigation ──
        goTab: function (t) {
          set({ tab: t });
          if (t === "retirement" && !get().magicRevealed) {
            setTimeout(function () { set({ magicRevealed: true }); }, 400);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        },

        // ── Expense helpers ──
        updateExpense: function (id, field, value) {
          set(function (s) {
            return { expenses: s.expenses.map(function (e) {
              return e.id === id ? Object.assign({}, e, (function(){ var o = {}; o[field] = value; return o; })()) : e;
            }) };
          });
        },
        addExpense: function () {
          set(function (s) {
            if (s.expenses.length >= 15) return {};
            var nId = s._nEId;
            return {
              expenses: s.expenses.concat([{ id: nId, name: "", amount: "", discretionary: true }]),
              _nEId: nId + 1,
            };
          });
        },
        removeExpense: function (id) {
          set(function (s) { return { expenses: s.expenses.filter(function (e) { return e.id !== id; }) }; });
        },

        // ── Debt helpers ──
        updateDebt: function (id, field, value) {
          set(function (s) {
            return { debts: s.debts.map(function (d) {
              return d.id === id ? Object.assign({}, d, (function(){ var o = {}; o[field] = value; return o; })()) : d;
            }) };
          });
        },
        addDebt: function () {
          set(function (s) {
            if (s.debts.length >= 8) return {};
            var nId = s._nDId;
            return {
              debts: s.debts.concat([{ id: nId, name: "", balance: "", rate: "", minPayment: "" }]),
              _nDId: nId + 1,
            };
          });
        },
        removeDebt: function (id) {
          set(function (s) { return { debts: s.debts.filter(function (d) { return d.id !== id; }) }; });
        },

        // ── Goal helpers ──
        updateGoal: function (id, field, value) {
          set(function (s) {
            return { goals: s.goals.map(function (g) {
              return g.id === id ? Object.assign({}, g, (function(){ var o = {}; o[field] = value; return o; })()) : g;
            }) };
          });
        },
        addGoal: function () {
          set(function (s) {
            if (s.goals.length >= 8) return {};
            var nId = s._nGId;
            return {
              goals: s.goals.concat([{ id: nId, name: "", amount: "", years: "", profileIdx: 4 }]),
              _nGId: nId + 1,
            };
          });
        },
        removeGoal: function (id) {
          set(function (s) { return { goals: s.goals.filter(function (g) { return g.id !== id; }) }; });
        },

        // ── Reset all ──
        clearAll: function () {
          set(Object.assign({}, INITIAL_STATE));
          try { localStorage.removeItem('manu-pro-state'); } catch(e) {}
        },
      });
    },
    {
      name: 'manu-pro-state',
      partialize: function (state) {
        var result = {};
        PERSISTED_FIELDS.forEach(function (key) {
          if (state[key] !== undefined) result[key] = state[key];
        });
        return result;
      },
    }
  )
);

export { DEFAULT_EXP };
export default useAppStore;
