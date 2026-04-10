import ExpenseService from "./expenseService";
import IncomeService from "./incomeService";
import LoanService from "./loanService";

const splitCsvLine = (line) => {
  const cols = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  cols.push(current.trim());
  return cols;
};

const parseCsv = (csvText) => {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.replace(/\uFEFF/g, "").trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
};

const ImportService = {
  importCsvText: async (csvText) => {
    const rows = parseCsv(csvText);
    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const type = (row.type || "").toLowerCase();
        const amount = Number(row.amount || 0);
        const date = row.date || new Date().toISOString().split("T")[0];
        const categoryId = row.category_id ? Number(row.category_id) : null;

        if (!type || !amount || amount <= 0) {
          failed += 1;
          errors.push(`Invalid row: ${JSON.stringify(row)}`);
          continue;
        }

        if (type === "expense") {
          await ExpenseService.create({
            category_id: categoryId,
            amount,
            description: row.description || row.title || "Imported expense",
            date,
          });
          imported += 1;
        } else if (type === "income") {
          await IncomeService.create({
            category_id: categoryId,
            amount,
            source: row.source || row.title || "Imported income",
            date,
          });
          imported += 1;
        } else if (type === "loan_given" || type === "loan_taken") {
          await LoanService.create({
            person_name: row.person_name || "Imported contact",
            amount,
            type: type === "loan_given" ? "given" : "taken",
            due_date: row.due_date || null,
            description: row.description || "Imported loan",
          });
          imported += 1;
        } else {
          failed += 1;
          errors.push(`Unsupported type: ${type}`);
        }
      } catch (e) {
        failed += 1;
        errors.push(e?.response?.data?.message || e?.message || "Import failed");
      }
    }

    return { imported, failed, errors };
  },
};

export default ImportService;
