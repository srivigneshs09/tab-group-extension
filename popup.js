// Load categories from storage
function loadCategories() {
  chrome.storage.sync.get(['categories'], function (data) {
    const categories = data.categories || [];
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    categories.forEach((category, index) => {
      const li = document.createElement('li');

      // Category name
      const span = document.createElement('span');
      span.textContent = category.name;
      span.onclick = () => showTabsInCategory(category.tabs);
      li.appendChild(span);

      // Rename button
      const renameButton = document.createElement('button');
      renameButton.textContent = 'Rename';
      renameButton.onclick = () => {
        const newName = prompt('Enter new category name:');
        if (newName) {
          category.name = newName;
          chrome.storage.sync.set({ categories });
          loadCategories();
        }
      };
      li.appendChild(renameButton);

      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => {
        categories.splice(index, 1);
        chrome.storage.sync.set({ categories });
        loadCategories();
      };
      li.appendChild(deleteButton);

      categoryList.appendChild(li);
    });
  });
}

// Show tabs in a specific category
function showTabsInCategory(tabs) {
  chrome.tabs.query({}, function (allTabs) {
    tabs.forEach(tabId => {
      const tab = allTabs.find(t => t.id === tabId);
      if (tab) {
        chrome.tabs.update(tabId, { active: true });
      }
    });
  });
}

// Load open tabs
function loadTabs() {
  chrome.tabs.query({}, function (tabs) {
    const tabList = document.getElementById('tab-list');
    tabList.innerHTML = '';

    tabs.forEach(tab => {
      const li = document.createElement('li');
      li.textContent = tab.title;
      li.draggable = true;

      // Drag start event
      li.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text/plain', tab.id);
      });

      tabList.appendChild(li);
    });
  });
}

// Enable dropping tabs into categories
document.getElementById('category-list').addEventListener('dragover', function (event) {
  event.preventDefault();
});

document.getElementById('category-list').addEventListener('drop', function (event) {
  event.preventDefault();
  const tabId = parseInt(event.dataTransfer.getData('text/plain'), 10);
  const categoryName = event.target.textContent;

  chrome.storage.sync.get(['categories'], function (data) {
    let categories = data.categories || [];
    let category = categories.find(cat => cat.name === categoryName);

    if (category && !category.tabs.includes(tabId)) {
      category.tabs.push(tabId);
      chrome.storage.sync.set({ categories });
      loadCategories();
    }
  });
});

// Add a new category
document.getElementById('add-category').addEventListener('click', function () {
  const categoryName = prompt('Enter category name:');
  if (categoryName) {
    chrome.storage.sync.get(['categories'], function (data) {
      const categories = data.categories || [];
      categories.push({ name: categoryName, tabs: [] });
      chrome.storage.sync.set({ categories });
      loadCategories();
    });
  }
});

// Initial load
loadCategories();
loadTabs();