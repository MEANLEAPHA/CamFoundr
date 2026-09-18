const STORAGE_KEY = "home_scroll_data";

export function saveScroll(key, value) {
  try {
    const data = {
      y: value.y,
      page: value.page,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      `${STORAGE_KEY}_${key}`,
      JSON.stringify(data)
    );
  } catch (e) {
    console.warn("Failed to save scroll position:", e);
  }
}

export function getScroll(key) {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);

    if (stored) {
      const data = JSON.parse(stored);

      // Expire after 1 hour
      if (Date.now() - data.timestamp < 3600000) {
        return {
          y: data.y,
          page: data.page,
        };
      }
    }
  } catch (e) {
    console.warn("Failed to get scroll position:", e);
  }

  return {
    y: 0,
    page: 1,
  };
}