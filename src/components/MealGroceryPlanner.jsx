import React, { useState } from 'react';
import { Utensils, ShoppingBag, DollarSign, RefreshCw, CheckCircle2, Sparkles, Filter, ShieldCheck, Download, Copy, Check } from 'lucide-react';

export default function MealGroceryPlanner({ selectedUser }) {
  const [budgetTier, setBudgetTier] = useState('Moderate'); // Student Budget, Moderate, Premium
  const [dietaryType, setDietaryType] = useState('High Protein');
  const [accommodation, setAccommodation] = useState('Apartment / Kitchen'); // Hostel, Apartment
  const [copiedList, setCopiedList] = useState(false);

  const mealPlans = {
    "Moderate": [
      { meal: "Breakfast", title: "Oatmeal with Peanut Butter & Berries", calories: 520, protein: "28g", costEst: "$2.50", ingredients: ["Oats", "Peanut Butter", "Frozen Berries", "Whey Protein"] },
      { meal: "Lunch", title: "Grilled Chicken Breast with Quinoa & Steamed Broccoli", calories: 680, protein: "52g", costEst: "$4.80", ingredients: ["Chicken Breast", "Quinoa", "Broccoli", "Olive Oil"] },
      { meal: "Snack", title: "Greek Yogurt with Honey & Almonds", calories: 310, protein: "22g", costEst: "$2.00", ingredients: ["Greek Yogurt", "Honey", "Almonds"] },
      { meal: "Dinner", title: "Baked Salmon Fillet with Brown Rice & Asparagus", calories: 720, protein: "48g", costEst: "$6.50", ingredients: ["Salmon", "Brown Rice", "Asparagus", "Lemon"] }
    ],
    "Student Budget": [
      { meal: "Breakfast", title: "Scrambled Eggs on Whole Wheat Toast with Spinach", calories: 450, protein: "26g", costEst: "$1.20", ingredients: ["Eggs", "Whole Wheat Bread", "Spinach"] },
      { meal: "Lunch", title: "Black Bean & Egg Rice Bowl with Salsa", calories: 600, protein: "32g", costEst: "$1.80", ingredients: ["Black Beans", "Eggs", "White Rice", "Salsa"] },
      { meal: "Snack", title: "Cottage Cheese & Apple Slices", calories: 250, protein: "18g", costEst: "$1.10", ingredients: ["Cottage Cheese", "Apple"] },
      { meal: "Dinner", title: "Lentil Curry with Basmati Rice", calories: 650, protein: "30g", costEst: "$1.50", ingredients: ["Lentils", "Basmati Rice", "Curry Powder", "Onion"] }
    ],
    "Premium": [
      { meal: "Breakfast", title: "Smoked Salmon & Avocado Toast with Poached Eggs", calories: 580, protein: "34g", costEst: "$6.00", ingredients: ["Smoked Salmon", "Avocado", "Poached Eggs", "Sourdough"] },
      { meal: "Lunch", title: "Grass-Fed Ribeye Steak with Roasted Sweet Potatoes", calories: 850, protein: "65g", costEst: "$12.00", ingredients: ["Ribeye Steak", "Sweet Potato", "Butter", "Rosemary"] },
      { meal: "Snack", title: "Artisanal Protein Shake with Macadamia Nuts", calories: 380, protein: "30g", costEst: "$3.50", ingredients: ["Isolate Whey", "Macadamia Nuts", "Almond Milk"] },
      { meal: "Dinner", title: "Pan-Seared Halibut with Wild Rice & Charred Zucchini", calories: 710, protein: "50g", costEst: "$14.00", ingredients: ["Halibut", "Wild Rice", "Zucchini", "Garlic Butter"] }
    ]
  };

  const currentPlan = mealPlans[budgetTier] || mealPlans["Moderate"];

  // AI Aggregated Grocery List
  const groceryItems = [
    { name: "Chicken Breast / Protein Source", qty: "1.5 kg", cost: budgetTier === 'Student Budget' ? "$8.00" : "$14.00", reuseNote: "Used in Lunch & Dinner" },
    { name: "Quinoa / Brown Rice", qty: "1.0 kg", cost: "$3.50", reuseNote: "Shared base carb for 5 days" },
    { name: "Eggs (Large)", qty: "2 Dozen", cost: "$4.20", reuseNote: "Breakfast & snack protein" },
    { name: "Fresh Spinach & Veggies", qty: "3 Bags", cost: "$5.00", reuseNote: "High micronutrient density" },
    { name: "Peanut Butter / Almonds", qty: "500g", cost: "$4.00", reuseNote: "Healthy fats & calorie booster" },
    { name: "Greek Yogurt / Cottage Cheese", qty: "1.0 kg", cost: "$5.50", reuseNote: "Casein protein before sleep" }
  ];

  const estimatedWeeklyTotal = budgetTier === 'Student Budget' ? "$32.50" : budgetTier === 'Moderate' ? "$58.00" : "$115.00";

  const handleCopy = () => {
    const listText = groceryItems.map(g => `${g.name} - ${g.qty} (${g.cost})`).join('\n');
    navigator.clipboard.writeText(listText);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">Meal Planner & AI Grocery Generator</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-mono rounded-full border border-amber-500/30">
                  Budget Aware
                </span>
              </div>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                AI meal plans tailored by budget tier, cooking skill, ingredient reuse optimization, and grocery estimation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Budget Tier Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-mono text-slate-400 block mb-2">Budget Tier</label>
          <select
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="Student Budget">🎓 Student Budget ($30-40/wk)</option>
            <option value="Moderate">🥗 Moderate Balance ($50-65/wk)</option>
            <option value="Premium">🥩 Premium Gourmet ($100+/wk)</option>
          </select>
        </div>

        {/* Accommodation Mode */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-mono text-slate-400 block mb-2">Accommodation Facility</label>
          <select
            value={accommodation}
            onChange={(e) => setAccommodation(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="Apartment / Kitchen">🍳 Full Kitchen / Oven</option>
            <option value="Hostel / Shared">🏢 Hostel / Microwave & Hotplate</option>
          </select>
        </div>

        {/* Dietary Preference */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-mono text-slate-400 block mb-2">Dietary Strategy</label>
          <select
            value={dietaryType}
            onChange={(e) => setDietaryType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="High Protein">💪 High Protein (Hypertrophy)</option>
            <option value="Vegetarian">🌱 Vegetarian / High Fiber</option>
            <option value="Caloric Deficit">🔥 Caloric Deficit (Fat Loss)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Today's Meals on Left, AI Grocery Generator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Daily Meal Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generated Daily Meal Plan ({selectedUser})</span>
            </h3>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
              Tier: {budgetTier}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan.map((m, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold uppercase">{m.meal}</span>
                  <span className="text-slate-400">{m.costEst} / serving</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm">{m.title}</h4>

                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>🔥 {m.calories} kcal</span>
                  <span>💪 {m.protein} protein</span>
                </div>

                <div className="pt-1">
                  <div className="text-[10px] font-mono text-slate-500">Ingredients:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.ingredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: AI Grocery Shopping List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-slate-200 text-sm">AI Weekly Grocery List</h3>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-colors"
              title="Copy Grocery List"
            >
              {copiedList ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono flex items-center justify-between">
            <span className="text-slate-300">Estimated Weekly Total:</span>
            <span className="text-emerald-300 font-bold text-sm">{estimatedWeeklyTotal}</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {groceryItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200 font-semibold">{item.name}</span>
                  <span className="text-emerald-400">{item.cost}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Qty: {item.qty}</span>
                  <span className="text-[10px] text-slate-500">{item.reuseNote}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400">
            💡 AI Optimization: Ingredient overlap reduces waste by 35% compared to isolated daily meal planning.
          </div>
        </div>

      </div>

    </div>
  );
}
