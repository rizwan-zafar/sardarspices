// Lightweight server-side validation helpers.
// We intentionally avoid pulling in a schema-validation library to keep
// the project dependency-light; these functions are simple and explicit.

export function validateCategory(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Name is required";
  if (data.status && !["ACTIVE", "INACTIVE"].includes(data.status)) {
    errors.status = "Invalid status";
  }
  return errors;
}

export function validateProduct(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Name is required";
  if (!data.categoryId) errors.categoryId = "Category is required";
  if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = "Valid price is required";
  }
  if (data.stock === undefined || data.stock === null || isNaN(Number(data.stock)) || Number(data.stock) < 0) {
    errors.stock = "Valid stock quantity is required";
  }
  return errors;
}

export function validateBlog(data) {
  const errors = {};
  if (!data.title || !data.title.trim()) errors.title = "Title is required";
  if (!data.content || !data.content.trim()) errors.content = "Content is required";
  if (!data.author || !data.author.trim()) errors.author = "Author is required";
  return errors;
}

export function validateContactMessage(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Name is required";
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "A valid email is required";
  }
  if (!data.message || !data.message.trim()) errors.message = "Message is required";
  return errors;
}

export function validateCheckout(data) {
  const errors = {};
  if (!data.customerName || !data.customerName.trim()) {
    errors.customerName = "Full name is required";
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "A valid email is required";
  }
  if (!data.phone || !/^[0-9+\-\s]{7,20}$/.test(data.phone)) {
    errors.phone = "A valid phone number is required";
  }
  if (!data.address || !data.address.trim()) {
    errors.address = "Complete address is required";
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.items = "Cart is empty";
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
