export type PairingCategory = string;

export type PairingMenuItem = {
  id: string;
  name: string;
  price: number;
  category: PairingCategory;
  stock?: boolean;
  inStock?: boolean;
};

const snackDrinks = ['Tea', 'Coffee', 'Lemon Tea'];
const mealDrinks = ['Watermelon', 'Lime Mojito', 'Mosambi', 'Blue Monday'];
const fastFoodDrinks = ['Cold Coffee', 'Orange', 'Lemon'];
const dessertPairings = ['Hot Cappuccino'];
const fallbackNames = ['Coffee', 'Tea', 'Vada', 'Bajji', 'Lime Mojito', 'Milkshake'];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const isInStock = (item: PairingMenuItem) => item.inStock ?? item.stock ?? false;
const findAvailableByNames = (catalog: PairingMenuItem[], names: string[]) => {
  const normalizedNames = names.map(normalize);
  return catalog.filter((item) => isInStock(item) && normalizedNames.includes(normalize(item.name)));
};

export function getAIPairingRecommendations(
  cartItems: PairingMenuItem[],
  catalog: PairingMenuItem[],
  limit = 3,
) {
  const cartIds = new Set(cartItems.map((item) => item.id));
  const cartNames = cartItems.map((item) => normalize(item.name));
  const hasCategory = (categories: string[]) => cartItems.some((item) => categories.includes(item.category));
  const hasName = (names: string[]) => names.some((name) => cartNames.some((cartName) => cartName.includes(normalize(name))));
  const suggestions: PairingMenuItem[] = [];
  const addUnique = (items: PairingMenuItem[]) => {
    items.forEach((item) => {
      if (!cartIds.has(item.id) && !suggestions.some((suggestion) => suggestion.id === item.id)) suggestions.push(item);
    });
  };

  if (hasCategory(['Puffs & Bakery', 'Snacks'])) addUnique(findAvailableByNames(catalog, snackDrinks));
  if (hasCategory(['Lunch', 'Main Course', 'Indochines'])) addUnique(findAvailableByNames(catalog, mealDrinks));
  if (hasName(['Sandwich', 'Burger'])) addUnique(findAvailableByNames(catalog, fastFoodDrinks));
  if (hasCategory(['Desserts', 'Cakes']) || hasName(['Cake', 'Dessert', 'Choco Lava'])) {
    addUnique(findAvailableByNames(catalog, dessertPairings));
    addUnique(catalog.filter((item) => isInStock(item) && item.category === 'Milkshakes'));
  }

  if (!suggestions.length) {
    addUnique(findAvailableByNames(catalog, fallbackNames));
    addUnique(catalog.filter((item) => isInStock(item) && ['Hot Drinks', 'Milkshakes', 'Fresh Juice & Mojito', 'Snacks'].includes(item.category)));
  }

  return suggestions.slice(0, limit);
}