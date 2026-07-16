export type Catalog = {
  id: string;
  name: string;
  activa: boolean;
};

export type Category = Catalog;
export type Tag = Catalog;
export type PaymentType = Catalog;
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
  payment_type_id: string;
  payment_type_name: string;
  payment_account_id: string | null;
  payment_account_name: string | null;
  tags: ExpenseTag[];
};
