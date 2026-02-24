let allProducts = [];
let cart = [];

const productsGrid = document.getElementById('products-grid');
const noProductsMsg = document.getElementById('no-products-msg');
const cartCountElement = document.getElementById('cart-count');
const categoryFilter = document.getElementById('category-filter');
const priceMinInput = document.getElementById('price-min');
const priceMaxInput = document.getElementById('price-max');
const applyFiltersBtn = document.getElementById('apply-filters-btn');

const modal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalBuyBtn = document.getElementById('modal-buy-btn');

const initApp = async () => {
  loadCartFromStorage();
  updateCartUI();
  
  await fetchProducts();
  populateCategories();
  renderProducts(allProducts);
};

const fetchProducts = async () => {
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('Помилка завантаження даних');
    allProducts = await response.json();
  } catch (error) {
    console.error('Помилка:', error);
    productsGrid.innerHTML = '<p class="text-red-500 col-span-full text-center">Не вдалося завантажити товари. Перевірте з\'єднання.</p>';
  }
};

const populateCategories = () => {
  const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryFilter.appendChild(option);
  });
};

const renderProducts = (productsToRender) => {
  productsGrid.innerHTML = ''; 

  if (productsToRender.length === 0) {
    productsGrid.classList.add('hidden');
    noProductsMsg.classList.remove('hidden');
    return;
  }

  productsGrid.classList.remove('hidden');
  noProductsMsg.classList.add('hidden');

  productsToRender.forEach((product, index) => {
    const card = document.createElement('article');
    card.className = `bg-gray-800 border border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:shadow-emerald-900/20 hover:border-gray-600 transition-all duration-300 card-appear flex flex-col`;
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div class="cursor-pointer flex-grow" onclick="openModal('${product.id}')">
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover bg-gray-900 opacity-90 hover:opacity-100 transition-opacity">
        <div class="p-4 relative">
          <span class="text-xs font-semibold text-emerald-500 uppercase tracking-wider">${product.category}</span>
          <h3 class="text-lg font-bold text-gray-100 mt-1">${product.name}</h3>
          <p class="text-gray-400 text-sm mt-2 line-clamp-2">${product.shortDescription}</p>
        </div>
      </div>
      <div class="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-800/50 mt-auto">
        <span class="text-lg font-bold text-emerald-400">${product.price} ₴</span>
        <button onclick="addToCart('${product.id}')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded transition-colors duration-300 shadow-md">
          Купити
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
};

const loadCartFromStorage = () => {
  const storedCart = localStorage.getItem('shoppingCart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
  }
};

const saveCartToStorage = () => {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
};

const updateCartUI = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = totalItems;
  
  cartCountElement.classList.add('animate-ping');
  setTimeout(() => cartCountElement.classList.remove('animate-ping'), 300);
};

const addToCart = (productId) => {
  const productInfo = allProducts.find(p => p.id === productId);
  if (!productInfo) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...productInfo, quantity: 1 });
  }

  saveCartToStorage();
  updateCartUI();
};

const applyFilters = () => {
  const selectedCategory = categoryFilter.value;
  const minPrice = parseFloat(priceMinInput.value) || 0;
  const maxPrice = parseFloat(priceMaxInput.value) || Infinity;

  const filteredProducts = allProducts.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchPrice = product.price >= minPrice && product.price <= maxPrice;
    return matchCategory && matchPrice;
  });

  renderProducts(filteredProducts);
};

window.openModal = (productId) => {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  modalImg.src = product.image;
  modalImg.alt = product.name;
  modalTitle.textContent = product.name;
  modalCategory.textContent = product.category;
  modalDesc.textContent = product.fullDescription;
  modalPrice.textContent = `${product.price} ₴`;
  
  modalBuyBtn.onclick = () => {
    addToCart(product.id);
    modal.close();
  };

  modal.showModal();
};


modal.addEventListener('click', (e) => {
  const dialogDimensions = modal.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    modal.close();
  }
});

applyFiltersBtn.addEventListener('click', applyFilters);

document.addEventListener('DOMContentLoaded', initApp);