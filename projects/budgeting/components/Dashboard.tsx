
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, subMonths, addMonths, subYears, addYears, format } from 'date-fns';
import { TEXTS } from '../textResources';

interface DashboardProps {
  expenses: Transaction[];
  categories: Category[];
  currency: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses: transactions, categories, currency }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Calculate Stats
  const stats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const currentMonthTransactions = transactions.filter(e => 
      isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
    );

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    
    // Group by category for chart (Expenses only)
    const categoryData = categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const amount = currentMonthTransactions
          .filter(e => e.categoryId === cat.id && e.type === 'expense')
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: cat.name, value: amount, color: cat.color };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // Monthly trend (Income vs Expense) - Last 6 months ending at currentMonth
    const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(currentMonth, 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthTrans = transactions.filter(e => 
        isWithinInterval(parseISO(e.date), { start, end })
      );
      
      return {
        name: format(date, 'MMM'),
        income: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        net: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      };
    });

    return {
      income,
      expense,
      balance,
      categoryData,
      monthlyTrend,
    };
  }, [transactions, categories, currency, currentMonth]);

  const isPositive = stats.balance >= 0;

  return (
    <div className="space-y-10 animate-fade-in-up pb-10">
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col justify-end space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Month Selector */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title={TEXTS.DASHBOARD.MONTH_SELECTOR.PREV_LABEL}
              >
                  <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="w-24 text-center text-sm font-bold text-gray-700 select-none">
                {format(currentMonth, 'MMMM')}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title={TEXTS.DASHBOARD.MONTH_SELECTOR.NEXT_LABEL}
              >
                  <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
              <button 
                onClick={() => setCurrentMonth(subYears(currentMonth, 1))} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title="Previous Year"
              >
                  <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="w-16 text-center text-sm font-bold text-gray-700 select-none">
                {format(currentMonth, 'yyyy')}
              </span>
              <button 
                onClick={() => setCurrentMonth(addYears(currentMonth, 1))} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                title="Next Year"
              >
                  <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            <button 
              onClick={() => setCurrentMonth(new Date())} 
              className="px-3 py-2 bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all ml-1"
            >
                {TEXTS.DASHBOARD.MONTH_SELECTOR.TODAY}
            </button>
          </div>

          <div className="flex items-baseline flex-wrap gap-4">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
              {formatCurrency(Math.abs(stats.balance), currency)}
            </h1>
            <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${isPositive ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              <span>{stats.income > 0 ? (stats.balance / stats.income * 100).toFixed(1) : '0.0'}%</span>
            </div>
          </div>
          <p className="text-gray-500 font-medium pt-1">{TEXTS.DASHBOARD.TOTAL_NET_BALANCE}</p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">{TEXTS.DASHBOARD.INCOME}</p>
                <h3 className="text-xl font-bold text-gray-900">{formatCurrency(stats.income, currency)}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold mb-1">{TEXTS.DASHBOARD.EXPENSES}</p>
                <h3 className="text-xl font-bold text-gray-900">{formatCurrency(stats.expense, currency)}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
           </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/60">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-lg font-bold text-gray-900">{TEXTS.DASHBOARD.NET_BALANCE_TREND}</h3>
           <div className="flex gap-2">
             <div className="flex items-center text-xs font-semibold text-gray-500">
                <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span> {TEXTS.DASHBOARD.NET_POSITIVE}
             </div>
             <div className="flex items-center text-xs font-semibold text-gray-500 ml-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> {TEXTS.DASHBOARD.NET_NEGATIVE}
             </div>
           </div>
        </div>
        <div className="h-[280px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12B76A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#12B76A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#98A2B3', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  hide={true}
                />
                <Tooltip 
                   formatter={(value: number) => [formatCurrency(value, currency), TEXTS.DASHBOARD.TOOLTIP_NET_BALANCE]}
                   contentStyle={{ 
                     backgroundColor: '#1D2939', 
                     color: '#fff', 
                     borderRadius: '12px', 
                     border: 'none', 
                     boxShadow: '0 12px 16px -4px rgba(16, 24, 40, 0.1)', 
                     padding: '12px 16px'
                   }}
                   itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}
                   cursor={{ stroke: '#EAECF0', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#12B76A" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorNet)" 
                  activeDot={{ r: 6, strokeWidth: 4, stroke: '#fff', fill: '#12B76A' }}
                />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Categories Pie */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/60 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{TEXTS.DASHBOARD.SPENDING_BY_CATEGORY}</h3>
            <button className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-lg"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            {stats.categoryData.length > 0 ? (
              <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={8}
                    stroke="none"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 6px -2px rgba(16, 24, 40, 0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-gray-900">{stats.categoryData.length}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{TEXTS.DASHBOARD.CATEGORIES_LABEL}</span>
              </div>
              </>
            ) : (
              <div className="text-gray-400 font-medium">{TEXTS.DASHBOARD.NO_DATA}</div>
            )}
          </div>
          <div className="mt-8 space-y-3">
            {stats.categoryData.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 ring-2 ring-white shadow-sm" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.value, currency)}</span>
                  <span className="text-xs font-semibold text-gray-400 w-10 text-right">
                    {Math.round((cat.value / stats.expense) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/60">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">{TEXTS.DASHBOARD.CASH_FLOW_HISTORY}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                <span className="text-xs font-semibold text-gray-500">{TEXTS.DASHBOARD.INCOME_LABEL}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                <span className="text-xs font-semibold text-gray-500">{TEXTS.DASHBOARD.EXPENSE_LABEL}</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrend} barGap={12}>
                <CartesianGrid vertical={false} stroke="#EAECF0" strokeDasharray="4 4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#667085', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${getCurrencySymbol(currency)}${val/1000}k`}
                  tick={{fill: '#98A2B3', fontSize: 11}} 
                />
                <Tooltip 
                   cursor={{ fill: '#F9FAFB' }}
                   contentStyle={{ borderRadius: '12px', border: '1px solid #EAECF0', boxShadow: '0 4px 6px -2px rgba(16, 24, 40, 0.05)' }}
                />
                <Bar dataKey="income" name="Income" fill="#12B76A" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="expense" name="Expense" fill="#1D2939" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
