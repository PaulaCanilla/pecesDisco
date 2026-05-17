/**
 * ShoppingCart — clase ES module para gestión del carrito con persistencia localStorage.
 */
export class ShoppingCart {
    static #KEY = 'aqua_cart';

    constructor() {
        this._items = ShoppingCart._load();
    }

    /** Copia inmutable de los items */
    get items() { return [...this._items]; }

    /** Precio total de todos los items */
    get total() {
        return this._items.reduce((sum, i) => sum + i.price * i.qty, 0);
    }

    /** Número total de unidades */
    get count() {
        return this._items.reduce((sum, i) => sum + i.qty, 0);
    }

    /**
     * Añade un producto. Si ya existe incrementa la cantidad.
     * @param {{ id, name, price, img, url, qty? }} product
     */
    add(product) {
        const existing = this._items.find(i => i.id === product.id);
        if (existing) {
            existing.qty += product.qty ?? 1;
        } else {
            this._items.push({ ...product, qty: product.qty ?? 1 });
        }
        this._save();
        return this;
    }

    /** Elimina un producto por id */
    remove(id) {
        this._items = this._items.filter(i => i.id !== id);
        this._save();
        return this;
    }

    /** Actualiza la cantidad de un producto. Si qty <= 0 lo elimina. */
    updateQty(id, qty) {
        if (qty <= 0) return this.remove(id);
        const item = this._items.find(i => i.id === id);
        if (item) { item.qty = qty; this._save(); }
        return this;
    }

    /** Vacía el carrito por completo */
    clear() {
        this._items = [];
        this._save();
        return this;
    }

    _save() {
        localStorage.setItem(ShoppingCart.#KEY, JSON.stringify(this._items));
    }

    static _load() {
        try {
            return JSON.parse(localStorage.getItem(ShoppingCart.#KEY)) || [];
        } catch {
            return [];
        }
    }
}
