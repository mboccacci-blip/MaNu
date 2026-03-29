export const INFLATION_DEFAULT = 0.025;
export const RET_NOM = 0.04;
export const SCENARIO_SPREAD = 0.02;

export const PROFILES = [
  { id:"vault",name:"Vault",nomReturn:0,realReturn:-0.025,desc:"Cash under the mattress. Loses to inflation.",icon:"🔒",color:"#64748b",risk:0,vol:0},
  { id:"cash",name:"Cash Investor",nomReturn:0.03,realReturn:0.005,desc:"Short-duration treasuries (BIL/SHV).",icon:"💵",color:"#94a3b8",risk:1,vol:0.01},
  { id:"cds",name:"CDs",nomReturn:0.035,realReturn:0.01,desc:"Certificates of Deposit. FDIC insured.",icon:"🏦",color:"#a78bfa",risk:2,vol:0},
  { id:"treasuries",name:"Treasuries",nomReturn:0.04,realReturn:0.015,desc:"Long-term US Treasury bonds (TLT).",icon:"🏛️",color:"#60a5fa",risk:3,vol:0.12},
  { id:"6040",name:"60 / 40",nomReturn:0.065,realReturn:0.04,desc:"60% stocks, 40% bonds. Balanced.",icon:"⚖️",color:"#34d399",risk:4,vol:0.10},
  { id:"8020",name:"80 / 20",nomReturn:0.075,realReturn:0.05,desc:"80% stocks, 20% bonds. Growth-tilted.",icon:"📈",color:"#22c55e",risk:5,vol:0.13},
  { id:"equities",name:"100% Equities",nomReturn:0.09,realReturn:0.065,desc:"All stocks (S&P 500). Highest return and volatility.",icon:"🚀",color:"#f59e0b",risk:6,vol:0.15},
];

export const DEFAULT_EXP = [
  {id:1,name:"Housing / Rent",amount:"",discretionary:false,mortgageAlt:"Property Tax, Insurance & HOA"},
  {id:2,name:"Food & Groceries",amount:"",discretionary:false},
  {id:3,name:"Transportation",amount:"",discretionary:true},
  {id:4,name:"Utilities & Bills",amount:"",discretionary:false},
  {id:5,name:"Dining Out",amount:"",discretionary:true},
];

export const BENCH_SR = [
  {minAge:16,maxAge:24,med:5,p25:2,p75:10,l:"Under 25"},
  {minAge:25,maxAge:34,med:8,p25:4,p75:15,l:"25-34"},
  {minAge:35,maxAge:44,med:9,p25:5,p75:18,l:"35-44"},
  {minAge:45,maxAge:54,med:10,p25:5,p75:20,l:"45-54"},
  {minAge:55,maxAge:64,med:12,p25:6,p75:22,l:"55-64"},
  {minAge:65,maxAge:99,med:15,p25:8,p75:25,l:"65+"},
];

export const BENCH_NW = [
  {minAge:16,maxAge:24,med:10800,p25:1000,p75:35000,l:"Under 25"},
  {minAge:25,maxAge:34,med:39000,p25:7500,p75:127000,l:"25-34"},
  {minAge:35,maxAge:44,med:135600,p25:27500,p75:400000,l:"35-44"},
  {minAge:45,maxAge:54,med:247200,p25:52000,p75:750000,l:"45-54"},
  {minAge:55,maxAge:64,med:364500,p25:71000,p75:1100000,l:"55-64"},
  {minAge:65,maxAge:99,med:409900,p25:82000,p75:1200000,l:"65+"},
];

export const TABS = [
  {id:"achieve",label:"Your MN",icon:"🎯"},
  {id:"inaction",label:"Cost of Inaction",icon:"💤"},
  {id:"assumptions",label:"You",icon:"🧑"},
  {id:"situation",label:"Income & Exp",icon:"💰"},
  {id:"debts",label:"Debts",icon:"💳"},
  {id:"invest",label:"Invest Options",icon:"📈"},
  {id:"portfolio",label:"Your Portfolio",icon:"🎛️"},
  {id:"retirement",label:"Retirement",icon:"🎯"},
  {id:"save",label:"Save More?",icon:"✂️"},
  {id:"earn",label:"Earn",icon:"💡"},
  {id:"cost",label:"Opp. Cost",icon:"🏷️"},
  {id:"goals",label:"Int. Needs",icon:"🏠"},
  {id:"score",label:"Score",icon:"🏆"},
  {id:"reports",label:"Reports",icon:"📄"},
  {id:"learn",label:"Guide",icon:"📖"},
];
