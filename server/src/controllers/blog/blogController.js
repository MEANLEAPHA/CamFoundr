const pool = require("../../config/db");

const blogFields = `
  b.id,
  b.slug,
  b.title,
  b.description,
  b.body,
  b.image_url,
  b.tags,
  b.read_time,
  b.status,
  b.created_at,
  b.updated_at,
  b.author_id,
  COALESCE(u.username, 'CamFoundr editorial') AS author,
  u.avatar_url
`;

const getUserId = (req) => req.user?.userId || req.user?.id;

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 8);
};

const slugify = (value) => String(value)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 90);

const getBlogQuery = `
  SELECT ${blogFields}
  FROM blogs b
  LEFT JOIN users u ON u.id = b.author_id
`;

const getBlogs = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
    const offset = (page - 1) * limit;
    const values = [];
    const filters = ["b.status = 'published'"];

    if (req.query.tag) {
      values.push(req.query.tag.trim());
      filters.push(`$${values.length} = ANY(b.tags)`);
    }

    if (req.query.search) {
      values.push(`%${req.query.search.trim()}%`);
      filters.push(`(b.title ILIKE $${values.length} OR b.description ILIKE $${values.length})`);
    }

    const filterSql = filters.join(" AND ");
    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM blogs b WHERE ${filterSql}`, values);
    values.push(limit, offset);
    const result = await pool.query(`${getBlogQuery} WHERE ${filterSql} ORDER BY b.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values);

    return res.json({
      data: result.rows,
      pagination: { page, limit, total: countResult.rows[0].total, totalPages: Math.ceil(countResult.rows[0].total / limit) },
    });
  } catch (error) {
    console.error("[getBlogs]", error);
    return res.status(500).json({ message: "Unable to load blog stories." });
  }
};

const getBlog = async (req, res) => {
  try {
    const identifier = req.params.slugOrId;
    const condition = /^\d+$/.test(identifier) ? "b.id = $1" : "b.slug = $1";
    const result = await pool.query(`${getBlogQuery} WHERE ${condition} AND b.status = 'published' LIMIT 1`, [identifier]);

    if (!result.rows.length) return res.status(404).json({ message: "Blog story not found." });
    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("[getBlog]", error);
    return res.status(500).json({ message: "Unable to load the blog story." });
  }
};

const createBlog = async (req, res) => {
  try {
    const authorId = getUserId(req);
    const { title, description, body, image_url, read_time, status = "draft" } = req.body;
    const tags = normalizeTags(req.body.tags);

    if (!authorId || !title?.trim() || !description?.trim() || !body?.trim()) {
      return res.status(400).json({ message: "title, description, and body are required." });
    }

    const baseSlug = slugify(title);
    if (!baseSlug) return res.status(400).json({ message: "A valid title is required." });

    const result = await pool.query(
      `INSERT INTO blogs (author_id, slug, title, description, body, image_url, tags, read_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, slug, title, description, body, image_url, tags, read_time, status, created_at, updated_at, author_id`,
      [authorId, `${baseSlug}-${Date.now().toString(36)}`, title.trim(), description.trim(), body.trim(), image_url || null, tags, read_time || null, status === "published" ? "published" : "draft"]
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error("[createBlog]", error);
    return res.status(500).json({ message: "Unable to create blog story." });
  }
};

const updateBlog = async (req, res) => {
  try {
    const authorId = getUserId(req);
    const blogId = req.params.blogId;
    const fields = [];
    const values = [];
    const body = req.body;
    const allowedFields = { title: "title", description: "description", body: "body", image_url: "image_url", read_time: "read_time", status: "status" };

    Object.entries(allowedFields).forEach(([key, column]) => {
      if (body[key] !== undefined) {
        values.push(key === "status" ? (body[key] === "published" ? "published" : "draft") : body[key]);
        fields.push(`${column} = $${values.length}`);
      }
    });

    if (body.tags !== undefined) {
      values.push(normalizeTags(body.tags));
      fields.push(`tags = $${values.length}`);
    }

    if (!fields.length) return res.status(400).json({ message: "No blog fields to update." });
    values.push(blogId, authorId);

    const result = await pool.query(
      `UPDATE blogs SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length - 1} AND author_id = $${values.length}
       RETURNING id, slug, title, description, body, image_url, tags, read_time, status, created_at, updated_at, author_id`,
      values
    );

    if (!result.rows.length) return res.status(404).json({ message: "Blog story not found or not owned by you." });
    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("[updateBlog]", error);
    return res.status(500).json({ message: "Unable to update blog story." });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM blogs WHERE id = $1 AND author_id = $2 RETURNING id", [req.params.blogId, getUserId(req)]);
    if (!result.rows.length) return res.status(404).json({ message: "Blog story not found or not owned by you." });
    return res.json({ message: "Blog story deleted.", id: result.rows[0].id });
  } catch (error) {
    console.error("[deleteBlog]", error);
    return res.status(500).json({ message: "Unable to delete blog story." });
  }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };
