import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import api from "../api/axios";

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
  exportToPdf: async (data, periodLabel) => {
    try {
      const html = createPdfHtml(data, periodLabel);
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

const createPdfHtml = (data, periodLabel) => {
  const { summary, categories, range } = data;
  const today = new Date().toLocaleDateString();

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
          h1 { text-align: center; color: #4F46E5; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; width: 30%; text-align: center; }
          .card h3 { margin: 0 0 10px; font-size: 14px; color: #666; }
          .card p { margin: 0; font-size: 18px; font-weight: bold; }
          .income { color: #10B981; }
          .expense { color: #EF4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <p>Period: ${periodLabel || "Custom"}</p>
          <p>Range: ${range.start} to ${range.end}</p>
        </div>

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
            <p style="color: ${summary.savings >= 0 ? "#10B981" : "#EF4444"}">
              Rs ${summary.savings.toLocaleString()}
            </p>
          </div>
        </div>

        <h2>Category Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${categories
              .map(
                (cat) => `
              <tr>
                <td>${cat.name}</td>
                <td>Rs ${cat.total.toLocaleString()}</td>
                <td>${cat.percentage}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          Generated on ${today} by Expense Tracker App
        </div>
      </body>
    </html>
  `;
};

export default ExportService;
