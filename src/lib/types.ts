export type Catalog = {
  id: string;
  name: string;
  activa: boolean;
};

export type Category = Catalog & { icon: string | null };
export type Tag = Catalog;
export type PaymentType = Catalog;
export type Person = Catalog;
export type PaymentAccount = Catalog & { payment_type_id: string };

export type ExpenseTag = {
  id: string;
  name: string;
};

export type ExpenseRow = {
  id: string;
  amount: number;
  description: string | null;
  expense_date: string;
  category_id: string;
  category_name: string;
  category_icon: string | null;
  payment_type_id: string;
  payment_type_name: string;
  payment_account_id: string | null;
  payment_account_name: string | null;
  tags: ExpenseTag[];
  // Préstamos (is_loan = true). Para gastos normales: is_loan=false y el
  // resto en null/false.
  is_loan: boolean;
  loan_person_id: string | null;
  loan_person_name: string | null;
  loan_paid: boolean;
  loan_paid_date: string | null;
};
