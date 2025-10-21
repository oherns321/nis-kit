export default async function decorate(block) {
  const blockChildren = [...block.children];

  // Check if we have a background image (typically in the first row/cell)
  if (blockChildren.length > 0) {
    const firstRow = blockChildren[0];
    const firstCell = firstRow.children[0];

    if (firstCell) {
      const img = firstCell.querySelector('img');
      if (img && img.src && img.src !== '') {
        // Set background image on the hero block
        block.style.backgroundImage = `url('${img.src}')`;
        // Remove the original image element since we're using it as background
        firstRow.remove();
      }
    }
  }

  // The remaining content (h1, etc.) will be handled by the existing CSS grid layout
}
