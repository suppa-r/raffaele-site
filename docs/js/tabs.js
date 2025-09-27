// Improved tab logic and structure

document.addEventListener("DOMContentLoaded", () => {
    const tabList = document.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    let tabFocus = tabs.findIndex(tab => tab.getAttribute("tabindex") === "0") || 0;

    // Keyboard navigation
    tabList.addEventListener('keydown', (e) => {
        const LEFT = 37, RIGHT = 39;
        if (![LEFT, RIGHT].includes(e.keyCode)) return;

        tabs[tabFocus].setAttribute("tabindex", -1);

        if (e.keyCode === RIGHT) {
            tabFocus = (tabFocus + 1) % tabs.length;
        } else if (e.keyCode === LEFT) {
            tabFocus = (tabFocus - 1 + tabs.length) % tabs.length;
        }

        tabs[tabFocus].setAttribute("tabindex", 0);
        tabs[tabFocus].focus();
    });

    // Click navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            activateTab(e.currentTarget, tabs);
        });
    });

    function activateTab(selectedTab, allTabs) {
        // Deselect all tabs
        allTabs.forEach(tab => {
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", -1);
        });

        // Select clicked tab
        selectedTab.setAttribute("aria-selected", "true");
        selectedTab.setAttribute("tabindex", 0);
        selectedTab.focus();

        // Show/hide panels
        const mainContainer = tabList.closest('[data-tabs-container]') || tabList.parentNode;
        const targetPanelId = selectedTab.getAttribute("aria-controls");
        if (!targetPanelId) return;

        mainContainer.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            panel.setAttribute("hidden", true);
        });

        const targetPanel = mainContainer.querySelector(`#${targetPanelId}`);
        if (targetPanel) targetPanel.removeAttribute("hidden");
    }
}
);