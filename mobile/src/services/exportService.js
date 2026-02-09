import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import api from "../api/axios";
import TransactionService from "../services/transactionService";

const ExportService = {
  /**
   * Export to CSV
   */
  exportToCsv: async (filters = {}) => {
    try {
      const { start_date, end_date } = filters;
      let url = `${api.defaults.baseURL}/api/export/transactions?`;
      if (start_date) url += `start_date=${start_date}&`;
      if (end_date) url += `end_date=${end_date}&`;

      // Download file
      const fileUri = FileSystem.documentDirectory + "transactions.csv";
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: api.defaults.headers.common["Authorization"],
        },
      });

      if (downloadRes.status !== 200) {
        throw new Error("Failed to download CSV");
      }

      // Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("CSV Export Error:", error);
      throw error;
    }
  },

  /**
   * Export to PDF
   */
  exportToPdf: async (data, periodLabel, filters = {}) => {
    try {
      // 1. Fetch Full Transaction List
      const { start_date, end_date } = filters;
      const transactionParams = {
        per_page: 500, // Fetch up to 500 for the report
        start_date,
        end_date,
      };

      const transactionsResponse =
        await TransactionService.getAll(transactionParams);
      const transactions =
        transactionsResponse.data.data || transactionsResponse.data || [];

      // 2. Generate HTML
      const html = createPdfHtml(data, periodLabel, transactions);

      // 3. Generate PDF
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      throw error;
    }
  },
};

const createPdfHtml = (data, periodLabel, transactions) => {
  const { summary, categories, range, chart_data } = data;
  const today = new Date().toLocaleDateString();
  const themeColor = "#4F46E5"; // Primary Color

  // QuickChart URLs
  const trendChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: chart_data.map((d) => d.label),
        datasets: [
          {
            label: "Income",
            data: chart_data.map((d) => d.income),
            backgroundColor: "#10B981",
          },
          {
            label: "Expense",
            data: chart_data.map((d) => d.expense),
            backgroundColor: "#EF4444",
          },
        ],
      },
      options: {
        legend: { display: true },
        title: { display: true, text: "Income vs Expense" },
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      },
    }),
  )}`;

  const categoryChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify({
      type: "doughnut",
      data: {
        labels: categories.map((c) => c.name),
        datasets: [
          {
            data: categories.map((c) => c.total),
            backgroundColor: categories.map((c) => c.color),
          },
        ],
      },
      options: {
        plugins: {
          doughnutlabel: {
            labels: [{ text: "Total", font: { size: 20 } }],
          },
        },
      },
    }),
  )}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <title>Financial Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          body { 
            font-family: 'Inter', Helvetica, sans-serif; 
            padding: 40px; 
            color: #1F2937; 
            background: #fff;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid ${themeColor};
            padding-bottom: 20px;
          }
          
          .logo-text {
            font-size: 24px;
            font-weight: 700;
            color: ${themeColor};
            letter-spacing: -0.5px;
          }
          
          .report-meta {
            text-align: right;
            font-size: 12px;
            color: #6B7280;
          }
          
          h1 { 
            font-size: 28px; 
            margin: 0 0 5px 0; 
            color: #111827;
          }
          
          h2 {
            font-size: 18px;
            color: #374151;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid ${themeColor};
            padding-left: 10px;
          }
          
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 20px; 
            margin-bottom: 40px; 
          }
          
          .card { 
            background: #F9FAFB; 
            border: 1px solid #E5E7EB; 
            border-radius: 12px; 
            padding: 20px; 
            text-align: center; 
          }
          
          .card h3 { 
            margin: 0 0 8px; 
            font-size: 12px; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            color: #6B7280; 
          }
          
          .card p { 
            margin: 0; 
            font-size: 22px; 
            font-weight: 700; 
            color: #1F2937;
          }
          
          .income { color: #10B981; }
          .expense { color: #EF4444; }
          .savings { color: ${summary.savings >= 0 ? "#10B981" : "#EF4444"}; }
          
          .charts-container {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
          }
          
          .chart-box {
            flex: 1;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 15px;
            background: #fff;
            text-align: center;
          }
          
          .chart-img {
            max-width: 100%;
            height: auto;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            font-size: 14px;
          }
          
          th { 
            background-color: #F3F4F6; 
            color: #374151; 
            font-weight: 600; 
            text-align: left; 
            padding: 12px 16px;
            border-bottom: 2px solid #E5E7EB;
          }
          
          td { 
            padding: 12px 16px; 
            border-bottom: 1px solid #E5E7EB; 
            color: #4B5563;
          }
          
          tr:last-child td { border-bottom: none; }
          
          .cat-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
          }
          
          .tx-income { color: #10B981; font-weight: 600; }
          .tx-expense { color: #EF4444; font-weight: 600; }

          .footer { 
            margin-top: 60px; 
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center; 
            font-size: 12px; 
            color: #9CA3AF; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">ExpenseTracker</div>
          <div class="report-meta">
             <p>Generated: ${today}</p>
             <p>Period: ${periodLabel}</p>
             <p>Range: ${range.start} - ${range.end}</p>
          </div>
        </div>

        <h1>Financial Overview</h1>
        
        <div class="summary-grid">
          <div class="card">
            <h3>Total Income</h3>
            <p class="income">Rs ${summary.income.toLocaleString()}</p>
          </div>
          <div class="card">
            <h3>Total Expense</h3>
            <p class="expense">Rs ${summary.expense.toLocaleString()}</p>
          </div>
          <div class="card">
            <h3>Net Savings</h3>
            <p class="savings">Rs ${summary.savings.toLocaleString()}</p>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-box">
            <img src="${trendChartUrl}" class="chart-img" />
          </div>
          <div class="chart-box">
            <img src="${categoryChartUrl}" class="chart-img" />
          </div>
        </div>
        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: right;">%</th>
            </tr>
          </thead>
          <tbody>
            ${categories
              .map(
                (cat) => `
              <tr>
                <td>
                  <span class="cat-dot" style="background-color: ${cat.color}"></span>
                  ${cat.name}
                </td>
                <td style="text-align: right;">Rs ${cat.total.toLocaleString()}</td>
                <td style="text-align: right;">${cat.percentage}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div style="page-break-after: always;"></div>

        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category/Type</th>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map((t) => {
                const isIncome = t.type === "income" || t.type === "loan_taken";
                const amountClass = isIncome ? "tx-income" : "tx-expense";
                const prefix = isIncome ? "+" : "-";
                const categoryName =
                  t.category?.name || t.type.toUpperCase().replace("_", " ");
                return `
              <tr>
                <td>${t.date}</td>
                <td>${categoryName}</td>
                <td>${t.title}</td>
                <td style="text-align: right;" class="${amountClass}">
                    ${prefix} Rs ${Math.abs(t.amount).toLocaleString()}
                </td>
              </tr>
            `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          Generated by Expense Tracker App &copy; ${new Date().getFullYear()}
        </div>
      </body>
    </html>
  `;
};

export default ExportService;
