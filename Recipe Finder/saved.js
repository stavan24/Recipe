/**
 * Saved recipes page functionality
 * Manages viewing and removing saved recipes from localStorage
 */

// DOM Elements
const savedGrid = document.getElementById("savedGrid")
const emptyState = document.getElementById("emptyState")
const savedCount = document.getElementById("savedCount")
const modalOverlay = document.getElementById("modalOverlay")
const modalContent = document.getElementById("modalContent")
const modalClose = document.getElementById("modalClose")

/**
 * Get saved recipes from localStorage
 */
function getSavedRecipes() {
  return JSON.parse(localStorage.getItem("savedRecipes") || "[]")
}

/**
 * Remove a recipe from saved list
 */
function removeRecipe(recipeId) {
  const saved = getSavedRecipes()
  const filtered = saved.filter((recipe) => recipe.idMeal !== recipeId)
  localStorage.setItem("savedRecipes", JSON.stringify(filtered))
  displaySavedRecipes()
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
 * Open modal with recipe details
 */
function openRecipeModal(recipeId) {
  const saved = getSavedRecipes()
  const recipe = saved.find((r) => r.idMeal === recipeId)

  if (!recipe) return

  const ingredients = getIngredients(recipe)

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
    </div>
  `

  modalOverlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

/**
 * Close the modal
 */
function closeModal() {
  modalOverlay.classList.remove("active")
  document.body.style.overflow = ""
}

/**
 * Display saved recipes in the grid
 */
function displaySavedRecipes() {
  const recipes = getSavedRecipes()

  // Update count
  const count = recipes.length
  savedCount.textContent = count > 0 ? `${count} recipe${count !== 1 ? "s" : ""} saved` : ""

  // Show empty state or recipes
  if (recipes.length === 0) {
    emptyState.classList.add("active")
    savedGrid.innerHTML = ""
    return
  }

  emptyState.classList.remove("active")

  savedGrid.innerHTML = recipes
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
        <button class="remove-button" data-id="${recipe.idMeal}">
          🗑️ Remove Recipe
        </button>
      </div>
    </article>
  `,
    )
    .join("")

  // Add click handlers for viewing recipe details
  document.querySelectorAll(".recipe-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Don't open modal if clicking remove button
      if (!e.target.closest(".remove-button")) {
        openRecipeModal(card.dataset.id)
      }
    })
  })

  // Add click handlers for remove buttons
  document.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      removeRecipe(button.dataset.id)
    })
  })
}

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

// Load saved recipes on page load
displaySavedRecipes()
