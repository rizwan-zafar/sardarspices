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

  const variants = Array.isArray(data.variants) ? data.variants : [];
  const named = variants.filter((variant) => String(variant.name || "").trim());
  if (!named.length) {
    errors.variants = "Add at least one variation, for example 100g or 10 pieces";
  } else {
    named.forEach((variant, index) => {
      if (variant.price === undefined || variant.price === "" || isNaN(Number(variant.price)) || Number(variant.price) < 0) {
        errors[`variants.${index}.price`] = "Valid price is required";
      }
      const compareAt = variant.compareAtPrice;
      if (compareAt !== undefined && compareAt !== null && compareAt !== "") {
        if (isNaN(Number(compareAt)) || Number(compareAt) < 0) {
          errors[`variants.${index}.compareAtPrice`] = "Original price must be a valid amount";
        } else if (!isNaN(Number(variant.price)) && Number(compareAt) <= Number(variant.price)) {
          errors[`variants.${index}.compareAtPrice`] = "Original price must be higher than the selling price";
        }
      }
      if (
        variant.stock === undefined ||
        variant.stock === "" ||
        isNaN(Number(variant.stock)) ||
        Number(variant.stock) < 0 ||
        !Number.isInteger(Number(variant.stock))
      ) {
        errors[`variants.${index}.stock`] = "Valid stock quantity is required";
      }
    });
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
