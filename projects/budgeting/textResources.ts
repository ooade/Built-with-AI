
export const TEXTS = {
  APP: {
    NAME: "Budget",
    NAME_HIGHLIGHT: "Master",
    USER_NAME: "John Doe",
    USER_PLAN: "Pro Plan",
    LOADING_DB: "Loading database...",
    LOADING_SETTINGS: "Loading settings...",
    PAGE_NOT_FOUND: "Page Not Found",
  },
  NAVIGATION: {
    DASHBOARD: "Overview",
    EXPENSES: "Transactions",
    REPORTS: "Analytics",
    IMPORT: "Import",
    COLLABORATION: "Collaborate",
    SETTINGS: "Settings",
  },
  DASHBOARD: {
    MONTH_SELECTOR: {
        PREV_LABEL: "Previous Month",
        NEXT_LABEL: "Next Month",
        TODAY: "Today"
    },
    TOTAL_NET_BALANCE: "Total Net Balance this month",
    INCOME: "Total Income",
    EXPENSES: "Total Expenses",
    NET_BALANCE_TREND: "Net Balance Trend",
    NET_POSITIVE: "Net Positive",
    NET_NEGATIVE: "Net Negative",
    SPENDING_BY_CATEGORY: "Spending by Category",
    CASH_FLOW_HISTORY: "Cash Flow History",
    INCOME_LABEL: "Income",
    EXPENSE_LABEL: "Expense",
    NO_DATA: "No expense data for this month",
    CATEGORIES_LABEL: "Categories",
    TOOLTIP_NET_BALANCE: "Net Balance"
  },
  EXPENSES: {
    TITLE: "Transactions",
    SUBTITLE: "Manage and track your financial activity",
    DELETE_SELECTED: (count: number) => `Delete (${count})`,
    ADD_TRANSACTION: "Add Transaction",
    SEARCH_PLACEHOLDER: "Search by description...",
    FILTERS: {
        ALL_TYPES: "All Types",
        ALL_CATEGORIES: "All Categories",
        TYPE_EXPENSE: "Expense",
        TYPE_INCOME: "Income"
    },
    TABLE: {
      DATE: "Date",
      CATEGORY: "Category",
      DESCRIPTION: "Description",
      ADDED_BY: "Added By",
      AMOUNT: "Amount",
      ACTIONS: "Actions",
      UNKNOWN_CATEGORY: "Unknown Category",
      ME: "Me",
      PEER: "Peer",
      NO_TRANSACTIONS_TITLE: "No transactions found matching your criteria."
    },
    MODAL: {
        EDIT_TITLE: "Edit Transaction",
        NEW_TITLE: "New Transaction",
        EXPENSE: "Expense",
        INCOME: "Income",
        AMOUNT_LABEL: "Amount",
        CATEGORY_LABEL: "Category",
        DATE_LABEL: "Date",
        DESCRIPTION_LABEL: "Description",
        DESCRIPTION_PLACEHOLDER: "What was this for?",
        CANCEL: "Cancel",
        SAVE: "Save Changes",
        ADD: "Add Transaction",
    },
    CONFIRM: {
        DELETE_SINGLE_TITLE: "Delete Transaction",
        DELETE_SINGLE_MSG: "Are you sure you want to remove this transaction? This action cannot be undone.",
        DELETE_SINGLE_BTN: "Delete Transaction",
        DELETE_BULK_TITLE: (count: number) => `Delete ${count} Transactions`,
        DELETE_BULK_MSG: (count: number) => `Are you sure you want to delete these ${count} transactions? This action cannot be undone.`,
        DELETE_BULK_BTN: "Delete All Selected",
    },
    TOAST: {
        ADD_SUCCESS: (type: string) => `${type} added`,
        ADD_ERROR: "Failed to add transaction",
        UPDATE_SUCCESS: "Transaction updated",
        UPDATE_ERROR: "Update failed",
        DELETE_SUCCESS: "Transaction deleted",
        DELETE_ERROR: "Deletion failed",
        BULK_DELETE_SUCCESS: (count: number) => `${count} transactions deleted`,
        BULK_DELETE_ERROR: "Bulk deletion failed",
        IMPORT_SUCCESS: (count: number) => `Successfully imported ${count} transactions`,
        IMPORT_ERROR: "Import failed"
    }
  },
  IMPORT: {
      TITLE: "Import Transactions",
      SUBTITLE: "Upload your bank statement (PDF, Excel, or CSV) to automatically extract and categorize transactions.",
      DRAG_DROP: {
          PROCESSING: "Processing File...",
          DEFAULT: "Drop PDF or Excel file here",
          SUPPORT: "Support for .pdf, .xlsx, .xls, and .csv files.",
          BUTTON_PROCESSING: "Processing...",
          BUTTON_DEFAULT: "Select File",
      },
      PREVIEW: {
          ITEMS_FOUND: (count: number) => `${count} items found`,
          DISCARD: "Discard",
          ADD_TO_PORTFOLIO: "Add to Portfolio",
          TABLE: {
              TYPE: "Type",
              DATE: "Date",
              DESCRIPTION: "Description",
              CATEGORY: "Category",
              AMOUNT: "Amount",
              SWITCH_TOOLTIP: (type: string) => `Switch to ${type}`
          },
          WARNING: "Please review transaction accuracy before importing",
      },
      ERRORS: {
          UNSUPPORTED: "Unsupported file type. Please upload PDF, Excel (.xlsx, .xls) or CSV files.",
          NO_VALID_DATA: "No valid transactions found. Please ensure the file contains readable text and follows a standard bank statement format.",
          FAILED: "Failed to process file. Please try again or ensure the file is not corrupted.",
      }
  },
  REPORTS: {
      TITLE: "Analytics",
      SUBTITLE: "Deep dive into your financial data",
      SELECT_PERIOD: "Select Period",
      FROM: "From",
      TO: "To",
      TOTAL_INCOME: "Total Income",
      TOTAL_EXPENSES: "Total Expenses",
      NET_BALANCE: "Net Balance",
      EXPORT: {
          TITLE: "Export Data",
          DESCRIPTION: "Download your raw transaction data for the selected date range. CSV files can be opened in Excel, Numbers, or Google Sheets.",
          CSV: "Export CSV",
          JSON: "Export JSON",
          CSV_FILENAME: (start: string, end: string) => `budget_export_${start}_${end}.csv`,
          JSON_FILENAME: (start: string, end: string) => `budget_backup_${start}_${end}.json`
      },
      SUMMARY: {
          TITLE: "Report Summary",
          TEXT_PRE: "This report contains",
          TEXT_COUNT: (count: number) => `${count} transactions`,
          TEXT_SPAN: (start: string, end: string) => `spanning from ${start} to ${end}.`,
      }
  },
  SETTINGS: {
      TITLE: "Settings",
      SUBTITLE: "Manage application preferences and categories",
      GENERAL: {
          TITLE: "General Preferences",
          CURRENCY: "Currency",
          REMINDER: "Daily Reminder",
          SAVE: "Save Changes",
          OPTIONS: {
              GBP: "British Pound (£)",
              USD: "US Dollar ($)",
              EUR: "Euro (€)",
              JPY: "Japanese Yen (¥)"
          }
      },
      CATEGORIES: {
          TITLE: "Custom Categories",
          NEW_PLACEHOLDER: "New Category Name",
          TYPE_EXPENSE: "Expense",
          TYPE_INCOME: "Income",
          DELETE_TOOLTIP: "Delete category"
      },
      DANGER: {
          TITLE: "Danger Zone",
          RESET_TITLE: "Factory Reset",
          RESET_DESC: "Permanently remove all transactions, custom categories, and settings. This action cannot be undone.",
          RESET_BTN: "Clear All Data",
      },
      CONFIRM: {
          DELETE_CAT_TITLE: "Delete Category",
          DELETE_CAT_MSG_EMPTY: "Are you sure you want to delete this category?",
          DELETE_CAT_MSG_USED: (count: number, fallback: string) => `This category is used in ${count} transactions. Deleting it will reassign these transactions to '${fallback}'. Do you wish to proceed?`,
          DELETE_CAT_BTN: "Delete Category",
          RESET_TITLE: "Reset Application",
          RESET_MSG: "CRITICAL WARNING: This action will permanently delete ALL transactions and custom categories. This cannot be undone. Are you absolutely sure?",
          RESET_BTN: "Yes, Wipe Everything",
      },
      TOAST: {
          SAVED: "Settings saved successfully",
          SAVE_ERROR: "Failed to save settings",
          CAT_ADDED: "Category added",
          CAT_ADD_ERROR: "Failed to add category",
          TRANS_MOVED: (catName: string) => `Transactions moved to ${catName}`,
          CAT_DELETED: "Category deleted",
          CAT_DELETE_ERROR: "Failed to delete category",
          DATA_CLEARED: "All data cleared",
          DATA_CLEAR_ERROR: "Failed to clear data",
      }
  },
  COLLABORATION: {
      TITLE: "Collaboration",
      SUBTITLE: "Sync your budget in real-time with family or partners.",
      HOST: {
          TITLE: "Share Budget",
          DESC: "Generate a secure connection code to allow another device to join your budget session. Data will be synced between both devices.",
          BTN_GEN: "Generate Code",
          BTN_GENERATING: "Generating Code...",
      },
      JOIN: {
          TITLE: "Join Session",
          DESC: "Enter a connection code from another device to sync with their budget. Your current data will be backed up before syncing.",
          PLACEHOLDER: "Enter Connection Code",
          BTN: "Connect to Peer",
      },
      ACTIVE: {
          TITLE: "Session Active",
          CONNECTED: "Connected",
          CONNECTED_PEER: "Connected to peer",
          WAITING: "Waiting for connection...",
          END_BTN: "End Session",
          SHARE_CODE_LABEL: "Share this Connection Code",
          WAITING_PEER_SPIN: "Waiting for peer...",
          BACKUP_TITLE: "Your data is backed up.",
          BACKUP_DESC: "If you joined this session, your original data will be restored when you disconnect. If you started this session, your current state will be saved.",
      },
      TOAST: {
          SYNC_SUCCESS: "Data synced from peer",
          CONNECTED: "Peer connected!",
          CONN_ERROR: "Connection error occurred",
          RESTORE_SUCCESS: "Session ended. Original data restored.",
          SESSION_ENDED: "Session ended.",
          STARTED: "Session started! Share your code.",
          CONNECTING: "Connecting to peer...",
          CODE_COPIED: "Connection code copied!"
      }
  },
  COMMON: {
      CONFIRM: "Confirm",
      CANCEL: "Cancel",
      LOADING: "Loading...",
  },
  DATA: {
     CATEGORIES: {
        GROCERIES: "Groceries",
        TRANSPORT: "Transport",
        UTILITIES: "Utilities",
        ENTERTAINMENT: "Entertainment",
        HEALTHCARE: "Healthcare",
        DINING: "Dining",
        SHOPPING: "Shopping",
        TRANSFER: "Transfer",
        OTHER_EXPENSE: "Other Expense",
        SALARY: "Salary",
        FREELANCE: "Freelance",
        INVESTMENTS: "Investments",
        GIFTS: "Gifts",
        OTHER_INCOME: "Other Income"
     },
     UNKNOWN_TRANSACTION: "Unknown Transaction",
  }
}
