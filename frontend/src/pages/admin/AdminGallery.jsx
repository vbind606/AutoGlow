import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminGallery.css";

const API_BASE = "http://localhost:8080";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "DETAILING",
  type: "BEFORE_AFTER",
  featured: false,
  active: true,
};

// =========================================================
// IMAGE URL
// =========================================================

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  return `${API_BASE}${imageUrl}`;
};

// =========================================================
// DATE FORMAT
// =========================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// CATEGORY LABEL
// =========================================================

const categoryLabel = (value) => {
  if (!value) {
    return "General";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// =========================================================
// TYPE LABEL
// =========================================================

const typeLabel = (value) => {
  if (!value) {
    return "Gallery";
  }

  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// =========================================================
// COMPONENT
// =========================================================

export default function AdminGallery() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD GALLERY
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("autoglow_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadGallery();
  }, [navigate]);

  // =========================================================
  // CLEAN BLOB URL
  // =========================================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // =========================================================
  // LOAD GALLERY API
  // =========================================================

  const loadGallery = async (showLoader = true) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get("/admin/gallery");

      const data = Array.isArray(response.data) ? response.data : [];

      setGallery(data);
    } catch (err) {
      console.error("Gallery loading error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");
        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load gallery.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    return [...new Set(gallery.map((item) => item.category).filter(Boolean))];
  }, [gallery]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total = gallery.length;

    const active = gallery.filter((item) => Boolean(item.active)).length;

    const featured = gallery.filter((item) => Boolean(item.featured)).length;

    const inactive = total - active;

    return {
      total,
      active,
      featured,
      inactive,
    };
  }, [gallery]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredGallery = useMemo(() => {
    const query = search.trim().toLowerCase();

    return gallery.filter((item) => {
      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && Boolean(item.active)) ||
        (statusFilter === "INACTIVE" && !Boolean(item.active));

      const matchesCategory =
        categoryFilter === "ALL" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [gallery, search, statusFilter, categoryFilter]);

  // =========================================================
  // CREATE
  // =========================================================

  const openCreate = () => {
    setEditingItem(null);

    setForm({
      ...EMPTY_FORM,
    });

    setSelectedImage(null);
    setImagePreview("");

    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModalOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEdit = (item) => {
    setEditingItem(item);

    setForm({
      title: item.title || "",
      description: item.description || "",
      category: item.category || "DETAILING",
      type: item.type || "BEFORE_AFTER",
      featured: Boolean(item.featured),
      active: item.active !== false,
    });

    setSelectedImage(null);

    setImagePreview(getImageUrl(item.imageUrl));

    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);

    setEditingItem(null);

    setForm({
      ...EMPTY_FORM,
    });

    setSelectedImage(null);
    setImagePreview("");

    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // -------------------------------------------------------
    // TYPE VALIDATION
    // -------------------------------------------------------

    if (!allowedTypes.includes(file.type)) {
      setFormError("Only JPG, PNG and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    // -------------------------------------------------------
    // SIZE VALIDATION
    // -------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be 5 MB or less.");

      event.target.value = "";
      return;
    }

    // -------------------------------------------------------
    // OLD BLOB CLEANUP
    // -------------------------------------------------------

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    // -------------------------------------------------------
    // SET IMAGE
    // -------------------------------------------------------

    setFormError("");

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =========================================================
  // REMOVE SELECTED IMAGE
  // =========================================================

  const removeSelectedImage = (event) => {
    event.stopPropagation();

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);

    if (editingItem) {
      setImagePreview(getImageUrl(editingItem.imageUrl));
    } else {
      setImagePreview("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setFormError("Gallery title is required.");
      return;
    }

    if (!form.category) {
      setFormError("Please select a category.");
      return;
    }

    if (!form.type) {
      setFormError("Please select a gallery type.");
      return;
    }

    // Image mandatory only during create
    if (!editingItem && !selectedImage) {
      setFormError("Please select an image for the gallery.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      // =====================================================
      // FORM DATA
      // =====================================================

      const formData = new FormData();

      formData.append("title", title);

      formData.append("description", description);

      formData.append("category", form.category);

      formData.append("type", form.type);

      formData.append("featured", String(Boolean(form.featured)));

      formData.append("active", String(Boolean(form.active)));

      // -----------------------------------------------------
      // IMAGE
      // -----------------------------------------------------

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // =====================================================
      // API REQUEST
      // =====================================================

      let response;

      if (editingItem) {
        response = await api.put(`/admin/gallery/${editingItem.id}`, formData);
      } else {
        response = await api.post("/admin/gallery", formData);
      }

      const savedItem = response.data;

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================

      if (editingItem) {
        setGallery((previous) =>
          previous.map((item) =>
            item.id === editingItem.id ? savedItem : item,
          ),
        );
      } else {
        setGallery((previous) => [savedItem, ...previous]);
      }

      // =====================================================
      // CLOSE
      // =====================================================

      setModalOpen(false);

      setEditingItem(null);

      setForm({
        ...EMPTY_FORM,
      });

      setSelectedImage(null);
      setImagePreview("");

      setFormError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Gallery save error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");

        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      const serverMessage =
        err.response?.data?.message || err.response?.data?.error;

      setFormError(serverMessage || "Unable to save gallery item.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete "${item.title}" from gallery?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/gallery/${item.id}`);

      setGallery((previous) =>
        previous.filter((galleryItem) => galleryItem.id !== item.id),
      );
    } catch (err) {
      console.error("Gallery delete error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");

        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      alert(err.response?.data?.message || "Unable to delete gallery item.");
    }
  };

  // =========================================================
  // TOGGLE ACTIVE
  // =========================================================

  const toggleActive = async (item) => {
    try {
      const response = await api.patch(`/admin/gallery/${item.id}/toggle`);

      setGallery((previous) =>
        previous.map((galleryItem) =>
          galleryItem.id === item.id ? response.data : galleryItem,
        ),
      );
    } catch (err) {
      console.error("Toggle active error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");

        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      alert(err.response?.data?.message || "Unable to update status.");
    }
  };

  // =========================================================
  // TOGGLE FEATURED
  // =========================================================

  const toggleFeatured = async (item) => {
    try {
      const response = await api.patch(`/admin/gallery/${item.id}/featured`);

      setGallery((previous) =>
        previous.map((galleryItem) =>
          galleryItem.id === item.id ? response.data : galleryItem,
        ),
      );
    } catch (err) {
      console.error("Toggle featured error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("autoglow_token");

        localStorage.removeItem("autoglow_role");

        navigate("/login");
        return;
      }

      alert(err.response?.data?.message || "Unable to update featured status.");
    }
  };

  // =========================================================
  // PREVIEW
  // =========================================================

  const openPreview = (item) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-gallery-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="gallery-page-header">
        <div className="gallery-header-copy">
          <div className="gallery-breadcrumb">
            <span>Admin</span>
            <span>/</span>
            <strong>Gallery</strong>
          </div>

          <div className="gallery-heading-row">
            <div>
              <span className="gallery-eyebrow">VISUAL SHOWCASE</span>

              <h1>
                Gallery
                <span>.</span>
              </h1>

              <p>
                Manage your detailing work, transformations and premium vehicle
                showcases.
              </p>
            </div>
          </div>
        </div>

        <div className="gallery-header-actions">
          <button
            className="gallery-refresh-btn"
            onClick={() => loadGallery(false)}
            disabled={refreshing}
          >
            <span
              className={refreshing ? "refresh-icon spinning" : "refresh-icon"}
            >
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button className="gallery-add-btn" onClick={openCreate}>
            <span>＋</span>
            Add Gallery
          </button>
        </div>
      </header>

      {/* ====================================================
          STATS
      ==================================================== */}

      <section className="gallery-stats">
        <div className="gallery-stat-card">
          <div className="gallery-stat-icon gold">◈</div>

          <div>
            <span>Total Gallery</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="gallery-stat-card">
          <div className="gallery-stat-icon green">✓</div>

          <div>
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
        </div>

        <div className="gallery-stat-card">
          <div className="gallery-stat-icon purple">★</div>

          <div>
            <span>Featured</span>
            <strong>{stats.featured}</strong>
          </div>
        </div>

        <div className="gallery-stat-card">
          <div className="gallery-stat-icon gray">○</div>

          <div>
            <span>Inactive</span>
            <strong>{stats.inactive}</strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          TOOLBAR
      ==================================================== */}

      <section className="gallery-toolbar">
        <div className="gallery-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search gallery..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="gallery-search-clear"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Status</option>

          <option value="ACTIVE">Active</option>

          <option value="INACTIVE">Inactive</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="ALL">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </section>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="gallery-content">
        {loading ? (
          <div className="gallery-state">
            <div className="gallery-loader"></div>

            <h3>Loading gallery...</h3>

            <p>Fetching your showcase images.</p>
          </div>
        ) : error ? (
          <div className="gallery-state error">
            <div className="gallery-state-icon">!</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button onClick={() => loadGallery()}>Try Again</button>
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="gallery-state empty">
            <div className="empty-gallery-icon">▧</div>

            <h3>No gallery items found</h3>

            <p>
              {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "Try changing your search or filters."
                : "Start building your gallery by adding your first image."}
            </p>

            {!search && statusFilter === "ALL" && categoryFilter === "ALL" && (
              <button onClick={openCreate}>＋ Add First Image</button>
            )}
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <article className="gallery-card" key={item.id}>
                {/* IMAGE */}

                <div
                  className="gallery-card-image"
                  onClick={() => openPreview(item)}
                >
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.title || "Gallery image"}
                    loading="lazy"
                  />

                  <div className="gallery-image-overlay">
                    <span className="gallery-view-icon">⤢</span>

                    <span>View Image</span>
                  </div>

                  {item.featured && (
                    <span className="gallery-featured-badge">★ Featured</span>
                  )}

                  <span
                    className={
                      item.active
                        ? "gallery-active-badge active"
                        : "gallery-active-badge inactive"
                    }
                  >
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* BODY */}

                <div className="gallery-card-body">
                  <div className="gallery-card-meta">
                    <span>{categoryLabel(item.category)}</span>

                    <span>•</span>

                    <span>{typeLabel(item.type)}</span>
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description || "No description added."}</p>

                  <div className="gallery-card-footer">
                    <span className="gallery-date">
                      {formatDate(item.createdAt)}
                    </span>

                    <div className="gallery-actions">
                      <button
                        type="button"
                        title="Toggle active"
                        className={
                          item.active
                            ? "gallery-icon-btn active"
                            : "gallery-icon-btn"
                        }
                        onClick={() => toggleActive(item)}
                      >
                        ◉
                      </button>

                      <button
                        type="button"
                        title="Toggle featured"
                        className={
                          item.featured
                            ? "gallery-icon-btn featured"
                            : "gallery-icon-btn"
                        }
                        onClick={() => toggleFeatured(item)}
                      >
                        ★
                      </button>

                      <button
                        type="button"
                        title="Edit"
                        className="gallery-icon-btn"
                        onClick={() => openEdit(item)}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        title="Delete"
                        className="gallery-icon-btn danger"
                        onClick={() => handleDelete(item)}
                      >
                        ♲
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ====================================================
          FORM MODAL
      ==================================================== */}

      {modalOpen && (
        <div
          className="gallery-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="gallery-modal">
            <div className="gallery-modal-header">
              <div>
                <span>{editingItem ? "UPDATE SHOWCASE" : "NEW SHOWCASE"}</span>

                <h2>{editingItem ? "Edit Gallery" : "Add Gallery"}</h2>
              </div>

              <button
                type="button"
                className="gallery-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* IMAGE */}

              <div className="gallery-form-group">
                <label>
                  Gallery Image
                  <em>*</em>
                </label>

                <div className="gallery-upload-box">
                  <input
                    ref={fileInputRef}
                    id="gallery-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                  />

                  <label
                    htmlFor="gallery-image"
                    className="gallery-upload-label"
                  >
                    {imagePreview ? (
                      <div className="gallery-selected-image">
                        <img src={imagePreview} alt="Selected gallery" />

                        <div className="gallery-change-overlay">
                          <span>↥</span>

                          <strong>Change Image</strong>

                          <small>JPG · PNG · WEBP</small>
                        </div>

                        {selectedImage && (
                          <button
                            type="button"
                            className="gallery-remove-image"
                            onClick={removeSelectedImage}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="gallery-upload-content">
                        <div className="gallery-upload-icon">↥</div>

                        <strong>Upload Gallery Image</strong>

                        <span>Click to browse from your computer</span>

                        <small>JPG, PNG or WEBP · Max 5 MB</small>
                      </div>
                    )}
                  </label>
                </div>

                {editingItem && !selectedImage && (
                  <small className="gallery-input-hint">
                    Leave unchanged to keep the current image.
                  </small>
                )}
              </div>

              {/* TITLE */}

              <div className="gallery-form-group">
                <label htmlFor="gallery-title">
                  Title
                  <em>*</em>
                </label>

                <input
                  id="gallery-title"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="e.g. BMW Ceramic Coating"
                  maxLength={150}
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="gallery-form-group">
                <label htmlFor="gallery-description">Description</label>

                <textarea
                  id="gallery-description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Describe this detailing work..."
                  rows={4}
                  maxLength={1000}
                />

                <small className="gallery-character-count">
                  {form.description.length}/1000
                </small>
              </div>

              {/* CATEGORY + TYPE */}

              <div className="gallery-form-row">
                <div className="gallery-form-group">
                  <label>
                    Category
                    <em>*</em>
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                  >
                    <option value="DETAILING">Detailing</option>

                    <option value="CERAMIC">Ceramic Coating</option>

                    <option value="PAINT">Paint Correction</option>

                    <option value="CAR_WASH">Car Wash</option>

                    <option value="INTERIOR">Interior</option>

                    <option value="BIKE">Bike</option>

                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div className="gallery-form-group">
                  <label>
                    Type
                    <em>*</em>
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                  >
                    <option value="BEFORE_AFTER">Before / After</option>

                    <option value="SHOWCASE">Showcase</option>

                    <option value="WORK">Work</option>

                    <option value="CUSTOMER">Customer Vehicle</option>
                  </select>
                </div>
              </div>

              {/* OPTIONS */}

              <div className="gallery-options">
                <label className="gallery-check">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleInputChange}
                  />

                  <span className="gallery-check-box">✓</span>

                  <div>
                    <strong>Featured image</strong>

                    <small>Highlight this image in featured gallery.</small>
                  </div>
                </label>

                <label className="gallery-check">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleInputChange}
                  />

                  <span className="gallery-check-box">✓</span>

                  <div>
                    <strong>Active</strong>

                    <small>Make this image visible in the gallery.</small>
                  </div>
                </label>
              </div>

              {/* ERROR */}

              {formError && (
                <div className="gallery-form-error">
                  <span>!</span>

                  {formError}
                </div>
              )}

              {/* ACTIONS */}

              <div className="gallery-modal-actions">
                <button
                  type="button"
                  className="gallery-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gallery-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="gallery-submit-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>✓</span>

                      {editingItem ? "Update Gallery" : "Save Gallery"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          IMAGE PREVIEW
      ==================================================== */}

      {previewOpen && previewItem && (
        <div className="gallery-preview-overlay" onClick={closePreview}>
          <div
            className="gallery-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-preview-close"
              onClick={closePreview}
            >
              ×
            </button>

            <img
              src={getImageUrl(previewItem.imageUrl)}
              alt={previewItem.title || "Gallery image"}
            />

            <div className="gallery-preview-info">
              <div>
                <span>{categoryLabel(previewItem.category)}</span>

                <h3>{previewItem.title}</h3>

                <p>{previewItem.description || "No description added."}</p>
              </div>

              {previewItem.featured && <strong>★ Featured</strong>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
