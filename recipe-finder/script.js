// 1. Seleksi Elemen DOM
const recipeListEl = document.getElementById('recipe-list');
const searchInputEl = document.getElementById('search-input');
const filterMealEl = document.getElementById('filter-meal');
const btnResetEl = document.getElementById('btn-reset');
const btnShowFavEl = document.getElementById('btn-show-favorites');
const favCountEl = document.getElementById('fav-count');
const statusMsgEl = document.getElementById('status-message');

const modalEl = document.getElementById('recipe-modal');
const modalBodyEl = document.getElementById('modal-body');
const closeModalEl = document.getElementById('close-modal');

// 2. State Aplikasi
let allRecipes = []; // Menyimpan semua data resep dari API
let favorites = JSON.parse(localStorage.getItem('favoriteRecipes')) || []; // Ambil data favorit dari LocalStorage
let showingFavoritesOnly = false;

// 3. Fungsi Fetch Data dari DummyJSON API
async function fetchRecipes() {
  try {
    statusMsgEl.textContent = 'Memuat resep...';
    const response = await fetch('https://dummyjson.com/recipes?limit=30');
    const data = await response.json();

    allRecipes = data.recipes;
    statusMsgEl.textContent = '';
    updateFavCount();
    renderRecipes(allRecipes);
  } catch (error) {
    statusMsgEl.textContent = 'Gagal memuat data resep. Periksa koneksi internet.';
    console.error('Error fetching recipes:', error);
  }
}

// 4. Fungsi Menampilkan Daftar Resep ke Halaman (Render)
function renderRecipes(recipes) {
  recipeListEl.innerHTML = '';

  if (recipes.length === 0) {
    statusMsgEl.textContent = 'Resep tidak ditemukan.';
    return;
  }

  statusMsgEl.textContent = '';

  recipes.forEach((recipe) => {
    const isFav = favorites.includes(recipe.id);

    const card = document.createElement('div');
    card.className = 'recipe-card';

    card.innerHTML = `
      <div>
        <img src="${recipe.image}" alt="${recipe.name}" />
        <div class="card-body">
          <div class="card-tags">${recipe.cuisine} • ${recipe.mealType.join(', ')}</div>
          <h2 class="card-title">${recipe.name}</h2>
          <div class="card-meta">
            ⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mnt | ⭐ ${recipe.rating} | 🔥 ${recipe.difficulty}
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-detail" onclick="showRecipeDetail(${recipe.id})">Lihat Detail</button>
        <button class="btn-fav ${isFav ? 'saved' : ''}" onclick="toggleFavorite(${recipe.id})">
          ${isFav ? '❤️' : '🤍'}
        </button>
      </div>
    `;

    recipeListEl.appendChild(card);
  });
}

// 5. Fungsi Searching & Filtering
function applyFilters() {
  const keyword = searchInputEl.value.toLowerCase().trim();
  const selectedMeal = filterMealEl.value;

  // Tentukan sumber data: semua resep atau hanya favorit
  let sourceList = showingFavoritesOnly
    ? allRecipes.filter((recipe) => favorites.includes(recipe.id))
    : allRecipes;

  // Filter berdasarkan nama dan kategori mealType
  const filtered = sourceList.filter((recipe) => {
    const matchName = recipe.name.toLowerCase().includes(keyword);
    const matchMeal =
      selectedMeal === 'all' || recipe.mealType.includes(selectedMeal);
    return matchName && matchMeal;
  });

  renderRecipes(filtered);
}

// 6. Fungsi Lihat Detail Resep (Modal)
function showRecipeDetail(id) {
  const recipe = allRecipes.find((item) => item.id === id);
  if (!recipe) return;

  modalBodyEl.innerHTML = `
    <h2>${recipe.name}</h2>
    <p><strong>Masakan:</strong> ${recipe.cuisine} | <strong>Kesulitan:</strong> ${recipe.difficulty} | <strong>Porsi:</strong> ${recipe.servings}</p>
    <img src="${recipe.image}" alt="${recipe.name}" class="modal-img" />

    <div class="modal-section">
      <h3>Bahan-bahan (Ingredients)</h3>
      <ul>
        ${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="modal-section">
      <h3>Cara Membuat (Instructions)</h3>
      <ol>
        ${recipe.instructions.map((step) => `<li>${step}</li>`).join('')}
      </ol>
    </div>
  `;

  modalEl.classList.remove('hidden');
}

// 7. Fungsi Simpan & Hapus Favorit (LocalStorage)
function toggleFavorite(id) {
  if (favorites.includes(id)) {
    // Hapus dari favorit
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    // Tambahkan ke favorit
    favorites.push(id);
  }

  // Simpan perubahan ke LocalStorage
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  updateFavCount();
  applyFilters(); // Render ulang tampilan kartu
}

function updateFavCount() {
  favCountEl.textContent = favorites.length;
}

// 8. Event Listeners
searchInputEl.addEventListener('input', applyFilters);
filterMealEl.addEventListener('change', applyFilters);

btnResetEl.addEventListener('click', () => {
  searchInputEl.value = '';
  filterMealEl.value = 'all';
  showingFavoritesOnly = false;
  btnShowFavEl.classList.remove('active');
  applyFilters();
});

btnShowFavEl.addEventListener('click', () => {
  showingFavoritesOnly = !showingFavoritesOnly;
  btnShowFavEl.classList.toggle('active', showingFavoritesOnly);
  applyFilters();
});

closeModalEl.addEventListener('click', () => {
  modalEl.classList.add('hidden');
});

modalEl.addEventListener('click', (e) => {
  if (e.target === modalEl) {
    modalEl.classList.add('hidden');
  }
});

// Jalankan aplikasi saat halaman dimuat
fetchRecipes();