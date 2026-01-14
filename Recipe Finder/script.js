const API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const recipesDiv = document.getElementById("recipes");
const toggle = document.getElementById("themeToggle");

if (localStorage.theme === "dark") {
  document.body.classList.add("dark");
}

toggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.theme = document.body.classList.contains("dark")
    ? "dark"
    : "light";
};

async function searchRecipes() {
  const query = document.getElementById("searchInput").value;
  const res = await fetch(API + query);
  const data = await res.json();

  recipesDiv.innerHTML = "";

  data.meals?.forEach(meal => {
    recipesDiv.innerHTML += `
      <div class="card">
        <img src="${meal.strMealThumb}">
        <div class="content">
          <h3>${meal.strMeal}</h3>
          <button onclick='openRecipe(${JSON.stringify(meal)})'>View Recipe</button>
        </div>
      </div>
    `;
  });
}

function openRecipe(meal) {
  localStorage.currentRecipe = JSON.stringify(meal);
  window.location.href = "recipe.html";
}
