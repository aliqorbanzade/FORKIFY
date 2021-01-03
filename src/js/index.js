import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

// Global state of the app
//  - search object
//  - current recipes object
//  - shoppping list obj
//  - liked recipes

const state = {};

/**
 * Search controller
 */

const controlSearch = async () => {
    //1) get the query from the view
    const query = searchView.getInput(); //todo

    if (query) {
        //2) new serach obj and add to state
        state.Search = new Search(query);

        // 3) prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            // 4) Search for recipes
            await state.Search.getResults();

            // 5)render results on the ui
            clearLoader();
            searchView.renderResults(state.Search.result);
        } catch (error) {
            alert("st went wrong");
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    controlSearch();
});

elements.searchRes.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-inline");
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.Search.result, goToPage);
    }
});

/**
 * Recipe controller
 */
const controlRecipe = async () => {
    //get the id from url
    const id = window.location.hash.replace("#", "");
    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.Search) {
            searchView.highlightSelected(id);
        }

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.Likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert("Error processing recipe!");
        }
    }
};
window.addEventListener("hashchange", controlRecipe);
window.addEventListener("load", controlRecipe);

// or ['hashchange' , 'hash'].forEach(event => window.addEventListener(event,controlRecipe))

/**
 * List controller
 */
const controlList = () => {
    //create a new list
    if (!state.List) state.List = new List();

    //add each ingredients
    state.recipe.ingredients.forEach((el) => {
        const item = state.List.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};
//handle delete and update list item events
elements.shopping.addEventListener("click", (e) => {
    const id = e.target.closest(".shopping__item").dataset.itemid;

    if (e.target.matches(".shopping__delete , .shopping__delete *")) {
        //del from state
        state.List.deleteItem(id);

        //del from ui
        listView.deleteItem(id);
    } else if (e.target.matches(".shopping__count--value ")) {
        const val = parseFloat(e.target.value, 10);
        state.List.updateCount(id, val);
    }
});

/**
 * Likes controller
 */

 //just for testing
 


const controlLike = () => {
    if (!state.likes) state.Likes = new Likes();
    const currentID = state.recipe.id;
    //user has not liked yet
    if (!state.Likes.isLiked(currentID)) {
        //add like to the state
        const newLike = state.Likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle like btn
            likesView.toggleLikeBtn(true)
        //add like to ui
         likesView.renderLike(newLike)   
    }
    //has liked
    else {
        //remove like to the state
        state.Likes.deleteLike(currentID)
        //toggle like btn
        likesView.toggleLikeBtn(false)
        //remove like to ui
        likesView.deleteLike(currentID)
    }
    likesView.toggleLikeMenu(state.Likes.getNumLikes())
};
//restore like recipes on page load
window.addEventListener('load',()=>{
    state.Likes = new Likes();
    state.Likes.readStorage();

 likesView.toggleLikeMenu(state.Likes.getNumLikes())

    state.Likes.likes.forEach(like => likesView.renderLike(like))
})

//handeling rcipe button clicks
elements.recipe.addEventListener("click", (e) => {
    if (e.target.matches(".btn-decrease, .btn-decrease *")) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches(".btn-increase, .btn-increase *")) {
        // Increase button is clicked
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches(".recipe__btn--add , .recipe__btn--add *")) {
        controlList();
    } else if (e.target.matches(".recipe__love , .recipe__love *")) {
        controlLike();
    }
});

