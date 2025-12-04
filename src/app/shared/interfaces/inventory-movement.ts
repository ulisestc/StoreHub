export interface InventoryMovement {
  id: string;
  product: number;
  product_name: string;
  type: 'in' | 'out' | 'loss';
  quantity: number;
  timestamp: string;
  user: number;
}

export interface InventoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryMovement[];
}
