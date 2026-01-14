/**
 * Recipe search and display functionality
 * Uses TheMealDB API to fetch and display recipes
 */

// DOM Elements
const searchInput = document.getElementById("searchInput")
const searchButton = document.getElementById("searchButton")
const recipeGrid = document.getElementById("recipeGrid")
const loadingState = document.getElementById("loadingState")
const emptyState = document.getElementById("emptyState")
const initialState = document.getElementById("initialState")
const modalOverlay = document.getElementById("modalOverlay")
const modalContent = document.getElementById("modalContent")
const modalClose = document.getElementById("modalClose")
const quickTags = document.querySelectorAll(".quick-tag")

// API Base URL
const API_BASE = "https://www.themealdb.com/api/json/v1/1"

// Current recipes data
let currentRecipes = []

/**
 * Show a specific state (loading, empty, initial)
 */
function showState(state) {
  loadingState.classList.remove("active")
  emptyState.classList.remove("active")
  initialState.classList.remove("active")
  recipeGrid.innerHTML = ""

  if (state === "loading") {
    loadingState.classList.add("active")
  } else if (state === "empty") {
    emptyState.classList.add("active")
  } else if (state === "initial") {
    initialState.classList.add("active")
  }
}

/**
 * Search recipes by name using TheMealDB API
 */
async function searchRecipes(query) {
  if (!query.trim()) {
    showState("initial")
    return
  }

  showState("loading")

  try {
    const response = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`)
    const data = await response.json()

    if (data.meals && data.meals.length > 0) {
      currentRecipes = data.meals
      displayRecipes(data.meals)
    } else {
      showState("empty")
    }
  } catch (error) {
    console.error("Error fetching recipes:", error)
    showState("empty")
  }
}

/**
 * Display recipe cards in the grid
 */
function displayRecipes(recipes) {
  recipeGrid.innerHTML = recipes
    .map(
      (recipe) => `
    <article class="recipe-card" data-id="${recipe.idMeal}">
      <img 
        src="${recipe.strMealThumb}" 
        alt="${recipe.strMeal}"
        class="recipe-card-image"
        loading="lazy"
      >
      <div class="recipe-card-content">
        <h3 class="recipe-card-title">${recipe.strMeal}</h3>
        <div class="recipe-card-meta">
          ${recipe.strCategory ? `<span class="recipe-tag">📁 ${recipe.strCategory}</span>` : ""}
          ${recipe.strArea ? `<span class="recipe-tag">🌍 ${recipe.strArea}</span>` : ""}
        </div>
      </div>
    </article>
  `,
    )
    .join("")

  // Add click handlers to recipe cards
  document.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", () => openRecipeModal(card.dataset.id))
  })
}

/**
 * Extract ingredients and measurements from recipe data
 */
function getIngredients(recipe) {
  const ingredients = []

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]
    const measure = recipe[`strMeasure${i}`]

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      })
    }
  }

  return ingredients
}

/**
 * Check if a recipe is already saved
 */
function isRecipeSaved(recipeId) {
  const saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]")
  return saved.some((recipe) => recipe.idMeal === recipeId)
}

/**
 * Save a recipe to localStorage
 */
function saveRecipe(recipe) {
  const saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]")

  // Check for duplicates
  if (!saved.some((r) => r.idMeal === recipe.idMeal)) {
    saved.push(recipe)
    localStorage.setItem("savedRecipes", JSON.stringify(saved))
    return true
  }

  return false
}

/**
 * Open modal with recipe details
 */
async function openRecipeModal(recipeId) {
  // Find recipe in current results or fetch it
  let recipe = currentRecipes.find((r) => r.idMeal === recipeId)

  if (!recipe) {
    try {
      const response = await fetch(`${API_BASE}/lookup.php?i=${recipeId}`)
      const data = await response.json()
      recipe = data.meals[0]
    } catch (error) {
      console.error("Error fetching recipe details:", error)
      return
    }
  }

  const ingredients = getIngredients(recipe)
  const isSaved = isRecipeSaved(recipe.idMeal)

  modalContent.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="modal-image">
    <div class="modal-body">
      <h2 class="modal-title">${recipe.strMeal}</h2>
      <div class="modal-meta">
        ${recipe.strCategory ? `<span class="recipe-tag">📁 ${recipe.strCategory}</span>` : ""}
        ${recipe.strArea ? `<span class="recipe-tag">🌍 ${recipe.strArea}</span>` : ""}
      </div>
      
      <div class="modal-section">
        <h3 class="modal-section-title">🥗 Ingredients</h3>
        <div class="ingredients-list">
          ${ingredients
            .map(
              (ing) => `
            <div class="ingredient-item">
              ${ing.measure} ${ing.ingredient}
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      
      <div class="modal-section">
        <h3 class="modal-section-title">👨‍🍳 Instructions</h3>
        <p class="instructions-text">${recipe.strInstructions}</p>
      </div>
      
      <button class="save-recipe-button ${isSaved ? "saved" : ""}" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&#39;")}'>
        ${isSaved ? "✓ Recipe Saved" : "💾 Save Recipe"}
      </button>
    </div>
  `

  // Add save button handler
  const saveButton = modalContent.querySelector(".save-recipe-button")
  saveButton.addEventListener("click", handleSaveRecipe)

  modalOverlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

/**
 * Handle save recipe button click
 */
function handleSaveRecipe(event) {
  const button = event.currentTarget
  const recipe = JSON.parse(button.dataset.recipe)

  if (saveRecipe(recipe)) {
    button.classList.add("saved")
    button.textContent = "✓ Recipe Saved"
  }
}

/**
 * Close the modal
 */
function closeModal() {
  modalOverlay.classList.remove("active")
  document.body.style.overflow = ""
}

/**
 * Handle search form submission
 */
function handleSearch() {
  const query = searchInput.value
  searchRecipes(query)
}

// Event Listeners
searchButton.addEventListener("click", handleSearch)

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch()
  }
})

// Quick search tags
quickTags.forEach((tag) => {
  tag.addEventListener("click", () => {
    const query = tag.dataset.search
    searchInput.value = query
    searchRecipes(query)
  })
})

// Modal close handlers
modalClose.addEventListener("click", closeModal)
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal()
  }
})

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal()
  }
})

// Show initial state on page load
showState("initial")
