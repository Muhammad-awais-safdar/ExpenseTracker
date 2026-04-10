import CategoryService from "./categoryService";
import ExpenseService from "./expenseService";
import IncomeService from "./incomeService";
import LoanService from "./loanService";
import BudgetService from "./budgetService";
import RecurringService from "./recurringService";
import MemoryCache from "../utils/memoryCache";

const toList = (data) => (Array.isArray(data?.data) ? data.data : (data || []));
const safeDate = (value) =>
  value
    ? new Date(value).toISOString().split("T")[0]
    : null;

const BackupService = {
  exportSnapshot: async () => {
    const [categories, expenses, incomes, loans, budgets, recurring] =
      await Promise.all([
        CategoryService.getAll(),
        ExpenseService.getAll(),
        IncomeService.getAll(),
        LoanService.getAll(),
        BudgetService.getAll(),
        RecurringService.getAll(),
      ]);

    const payload = {
      exported_at: new Date().toISOString(),
      categories: toList(categories),
      expenses: toList(expenses),
      incomes: toList(incomes),
      loans: toList(loans),
      budgets: toList(budgets),
      recurring: toList(recurring),
    };

    return JSON.stringify(payload, null, 2);
  },

  restoreSnapshot: async (snapshotText) => {
    const parsed = JSON.parse(snapshotText);
    const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
    const expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const incomes = Array.isArray(parsed.incomes) ? parsed.incomes : [];
    const loans = Array.isArray(parsed.loans) ? parsed.loans : [];
    const budgets = Array.isArray(parsed.budgets) ? parsed.budgets : [];
    const recurring = Array.isArray(parsed.recurring) ? parsed.recurring : [];

    let restored = 0;
    let skipped = 0;

    const localCatMap = new Map();
    const existingCategoriesRaw = await CategoryService.getAll();
    const existingCategories = toList(existingCategoriesRaw);
    existingCategories.forEach((c) => {
      localCatMap.set(`${c.type}:${(c.name || "").toLowerCase()}`, c.id);
    });

    for (const c of categories) {
      const key = `${c.type}:${(c.name || "").toLowerCase()}`;
      if (localCatMap.has(key)) {
        skipped += 1;
        continue;
      }
      try {
        const created = await CategoryService.create({
          name: c.name,
          type: c.type || "expense",
          icon: c.icon || "help-circle",
          color: c.color || "#808080",
        });
        localCatMap.set(key, created.id);
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    const resolveCategoryId = (catObj, fallbackType) => {
      if (!catObj?.name) return null;
      const key = `${catObj.type || fallbackType}:${catObj.name.toLowerCase()}`;
      return localCatMap.get(key) || null;
    };

    const [existingExpensesRaw, existingIncomesRaw, existingLoansRaw] =
      await Promise.all([
        ExpenseService.getAll(),
        IncomeService.getAll(),
        LoanService.getAll(),
      ]);

    const existingExpenseFingerprints = new Set(
      toList(existingExpensesRaw).map(
        (e) =>
          `${Number(e.amount)}|${safeDate(e.date)}|${(e.description || "").toLowerCase()}`,
      ),
    );
    const existingIncomeFingerprints = new Set(
      toList(existingIncomesRaw).map(
        (i) =>
          `${Number(i.amount)}|${safeDate(i.date)}|${(i.source || "").toLowerCase()}`,
      ),
    );
    const existingLoanFingerprints = new Set(
      toList(existingLoansRaw).map(
        (l) =>
          `${Number(l.amount)}|${(l.person_name || "").toLowerCase()}|${l.type}|${safeDate(l.due_date) || ""}`,
      ),
    );

    for (const e of expenses) {
      try {
        const fingerprint = `${Number(e.amount)}|${safeDate(e.date)}|${(e.description || "").toLowerCase()}`;
        if (existingExpenseFingerprints.has(fingerprint)) {
          skipped += 1;
          continue;
        }
        await ExpenseService.create({
          amount: Number(e.amount),
          description: e.description || "Restored expense",
          date: e.date,
          category_id: resolveCategoryId(e.category, "expense"),
        });
        existingExpenseFingerprints.add(fingerprint);
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    for (const i of incomes) {
      try {
        const fingerprint = `${Number(i.amount)}|${safeDate(i.date)}|${(i.source || "").toLowerCase()}`;
        if (existingIncomeFingerprints.has(fingerprint)) {
          skipped += 1;
          continue;
        }
        await IncomeService.create({
          amount: Number(i.amount),
          source: i.source || "Restored income",
          date: i.date,
          category_id: resolveCategoryId(i.category, "income"),
        });
        existingIncomeFingerprints.add(fingerprint);
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    for (const l of loans) {
      try {
        const fingerprint = `${Number(l.amount)}|${(l.person_name || "").toLowerCase()}|${l.type || "given"}|${safeDate(l.due_date) || ""}`;
        if (existingLoanFingerprints.has(fingerprint)) {
          skipped += 1;
          continue;
        }
        await LoanService.create({
          person_name: l.person_name || "Restored contact",
          amount: Number(l.amount),
          type: l.type || "given",
          due_date: l.due_date || null,
          description: l.description || "Restored loan",
        });
        existingLoanFingerprints.add(fingerprint);
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    for (const b of budgets) {
      try {
        await BudgetService.create({
          category_id: resolveCategoryId(b.category, "expense"),
          amount: Number(b.amount),
          period: b.period || "monthly",
          start_date: b.start_date,
          end_date: b.end_date,
        });
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    for (const r of recurring) {
      try {
        await RecurringService.create({
          type: r.type || "expense",
          amount: Number(r.amount),
          title: r.title || "Restored recurring",
          category_id: resolveCategoryId(r.category, r.type || "expense"),
          frequency: r.frequency || "monthly",
          start_date: r.start_date || new Date().toISOString().split("T")[0],
        });
        restored += 1;
      } catch {
        skipped += 1;
      }
    }

    MemoryCache.clear();
    return { restored, skipped };
  },
};

export default BackupService;
