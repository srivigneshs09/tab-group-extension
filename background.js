// Predefined categories and their keywords
const predefinedCategories = [
  { name: "Work", keywords: ["work", "project", "task"] },
  { name: "Entertainment", keywords: ["youtube", "netflix", "movie"] },
  { name: "Shopping", keywords: ["amazon", "ebay", "shopping"] }
];

// Function to auto-categorize a tab
function autoCategorizeTab(tab) {
  chrome.storage.sync.get(['categories'], function (data) {
    let categories = data.categories || [];

    // Check if the tab matches any predefined category
    predefinedCategories.forEach(category => {
      const matchesKeyword = category.keywords.some(keyword =>
        tab.url.includes(keyword) || tab.title.toLowerCase().includes(keyword)
      );

      if (matchesKeyword) {
        // Find or create the category
        let existingCategory = categories.find(cat => cat.name === category.name);
        if (!existingCategory) {
          existingCategory = { name: category.name, tabs: [] };
          categories.push(existingCategory);
        }

        // Add the tab to the category if not already present
        if (!existingCategory.tabs.includes(tab.id)) {
          existingCategory.tabs.push(tab.id);
        }
      }
    });

    // Save updated categories
    chrome.storage.sync.set({ categories });
  });
}

// Listen for new tabs being created
chrome.tabs.onCreated.addListener(function (tab) {
  autoCategorizeTab(tab);
});

// Listen for tab updates (e.g., when the title or URL changes)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    autoCategorizeTab(tab);
  }
});