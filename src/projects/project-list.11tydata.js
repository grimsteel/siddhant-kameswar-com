export const eleventyComputed = {
  categoryData(data) {
    return data.categories?.find?.(c => c.id === data.category);
  },
  title(data) {
    return data.categoryData?.name;
  }
};
