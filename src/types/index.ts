export type CategoryId = 'todos' | 'temakis' | 'entradas' | 'bebidas' | 'sobremesas';

export interface Category {
  id: CategoryId;
  name: string;
  iconName?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  badge?: string;
  spicy?: boolean;
  popular?: boolean;
  isTemaki?: boolean;
  imageUrl: string;
  imageFallbackType: 'temaki-salmon' | 'temaki-tuna' | 'temaki-skin' | 'sunomono' | 'cha-verde' | 'temaki-hot' | 'guioza' | 'drink' | 'dessert';
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  type: 'addition' | 'removal';
}

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  removals: string[];
  additions: CustomizationOption[];
  observation: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface OrderPayload {
  codigo_pedido: string;
  cliente_nome: string;
  cliente_telefone: string;
  itens: {
    nome: string;
    quantidade: number;
    adicionais: string[];
    remocoes: string[];
    valor_unitario: number;
    valor_total: number;
    observacao?: string;
  }[];
  valor_total: number;
  observacoes: string;
  criado_em?: string;
}
